import { describe,it,expect,vi,afterEach } from 'vitest';
import { recommend,mockSelections,eligible } from '../src/lib/engine';
import { samples } from '../src/data/profiles';
import { library } from '../src/lib/library';
import { geminiProvider } from '../src/lib/gemini';
import { POST } from '../src/app/api/recommend/route';
import { storeSchema,emptyStore } from '../src/lib/storage';
const p=samples[0];
const body=(mode='mock')=>({profile:p,history:[],mode});
const request=(data:unknown,headers:Record<string,string>={})=>new Request('http://localhost/api/recommend',{method:'POST',body:JSON.stringify(data),headers:{'Content-Type':'application/json',...headers}});
afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks();});
describe('recommendation boundary',()=>{
 it('contains 40 unreviewed original fixtures across all categories',()=>{expect(library).toHaveLength(40);expect(new Set(library.map(a=>a.category)).size).toBe(5);expect(library.every(a=>a.source.review==='unreviewed')).toBe(true);expect(library.filter(a=>a.source.url)).toHaveLength(4);});
 it('never admits missing prerequisites across every month',()=>{for(let age=0;age<72;age++)expect(eligible({...p,age,abilities:[]},[]).every(a=>!a.prerequisites.length)).toBe(true);});
 it('applies every eligibility dimension across all sample profiles',()=>{for(const p of samples)for(const a of eligible(p,[])){expect(a.minAge).toBeLessThanOrEqual(p.age);expect(a.maxAge).toBeGreaterThanOrEqual(p.age);expect(p.focus).toContain(a.category);expect(a.minutes).toBeLessThanOrEqual(p.duration);expect(a.materials.every(m=>p.materials.includes(m))).toBe(true);}});
 it('gracefully falls back when provider throws',async()=>{const r=await recommend(body(),{name:'broken',select:async()=>{throw Error('secret provider error');}});expect(r.mode).toBe('fallback');expect(r.message).not.toContain('secret');expect(r.recommendations).toHaveLength(3);});
 it('accepts grounded structured provider output',async()=>{const r=await recommend(body(),{name:'transport-fixture',select:async()=>({output:{selections:mockSelections(p,[])}})});expect(r.mode).toBe('live');});
 it('rejects duplicate history event IDs',async()=>{const h={id:'same',profileId:p.id,activityId:'language-03',date:'2026-11-20T00:00:00Z',status:'completed',feedback:[],rationale:'fixture',mode:'mock'};await expect(recommend({...body(),history:[h,h]})).rejects.toThrow();});
 it('ignores another profile’s feedback',async()=>{const h={id:'other',profileId:'other',activityId:'language-03',date:'2026-11-20T00:00:00Z',status:'completed',feedback:['struggled'],rationale:'fixture',mode:'mock'};expect((await recommend({...body(),history:[h]})).recommendations).toEqual((await recommend(body())).recommendations);});
 it('rejects corrupted stored data',()=>{expect(storeSchema.safeParse({...emptyStore,profiles:[{nickname:'bad'}]}).success).toBe(false);});
});
describe('Gemini transport without external requests',()=>{
 it('sends minimized context and validates a successful transport fixture',async()=>{let sent='';const fetcher=vi.fn(async(_url:unknown,options:RequestInit|undefined)=>{sent=String(options?.body);return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({selections:mockSelections(p,[])})}]}}],usageMetadata:{promptTokenCount:100,candidatesTokenCount:40}}));}) as unknown as typeof fetch;
 const r=await recommend(body(),geminiProvider({key:'fake-test-key',model:'test-model',fetcher}));expect(r.mode).toBe('live');expect(r.usage).toEqual({input:100,output:40});expect(sent).not.toContain(p.nickname);expect(sent).not.toContain('fake-test-key');expect(fetcher).toHaveBeenCalledTimes(1);});
 it.each([429,500,503])('handles HTTP %i as explicit fallback',async status=>{const fetcher=vi.fn(async()=>new Response('',{status})) as unknown as typeof fetch;expect((await recommend(body(),geminiProvider({key:'fixture',model:'test',fetcher}))).mode).toBe('fallback');expect(fetcher).toHaveBeenCalledTimes(1);});
 it.each(['blocked','malformed','truncated','timeout'])('handles %s output without rendering provider text',async kind=>{const fetcher=vi.fn(async()=>{if(kind==='timeout')throw new DOMException('timeout','TimeoutError');return new Response(JSON.stringify({candidates:[{finishReason:kind==='truncated'?'MAX_TOKENS':kind==='blocked'?'SAFETY':'STOP',content:{parts:[{text:'not json'}]}}]}));}) as unknown as typeof fetch;expect((await recommend(body(),geminiProvider({key:'fixture',model:'test',fetcher}))).mode).toBe('fallback');});
});
describe('server access controls',()=>{
 it('supports mock mode without a key',async()=>{vi.stubEnv('GEMINI_API_KEY','');const r=await POST(request(body()));expect(r.status).toBe(200);expect((await r.json()).mode).toBe('mock');});
 it('rejects malformed input',async()=>{expect((await POST(request({profile:{}}))).status).toBe(400);});
 it('rejects cross-origin requests',async()=>{expect((await POST(request(body(),{origin:'https://unrelated.test'}))).status).toBe(403);});
 it('rejects oversized bodies',async()=>{expect((await POST(request(body(),{'content-length':'100001'}))).status).toBe(413);});
 it('locks live calls without classroom access',async()=>{vi.stubEnv('DEMO_ACCESS_CODE','');expect((await POST(request(body('live')))).status).toBe(403);});
 it('locks live calls until live acceptance gate is passed',async()=>{vi.stubEnv('DEMO_ACCESS_CODE','sixteen-character-code');vi.stubEnv('AI_MODE','live');vi.stubEnv('LIVE_EVAL_PASSED','false');expect((await POST(request(body('live'),{'x-demo-access':'sixteen-character-code'}))).status).toBe(503);});
 it('locks hosted live calls without deployment protection',async()=>{vi.stubEnv('DEMO_ACCESS_CODE','sixteen-character-code');vi.stubEnv('AI_MODE','live');vi.stubEnv('LIVE_EVAL_PASSED','true');vi.stubEnv('GEMINI_API_KEY','fixture');vi.stubEnv('VERCEL','1');vi.stubEnv('CLASSROOM_DEPLOYMENT_PROTECTED','false');expect((await POST(request(body('live'),{'x-demo-access':'sixteen-character-code'}))).status).toBe(503);});
 it('rate limits configured classroom calls without real network',async()=>{vi.stubEnv('DEMO_ACCESS_CODE','sixteen-character-code');vi.stubEnv('AI_MODE','live');vi.stubEnv('LIVE_EVAL_PASSED','true');vi.stubEnv('GEMINI_API_KEY','fixture');vi.stubEnv('VERCEL','');vi.stubGlobal('fetch',vi.fn(async()=>new Response('',{status:503})));for(let i=0;i<3;i++)expect((await POST(request(body('live'),{'x-demo-access':'sixteen-character-code'}))).status).toBe(200);const r=await POST(request(body('live'),{'x-demo-access':'sixteen-character-code'}));expect(r.status).toBe(429);vi.unstubAllGlobals();});
});
