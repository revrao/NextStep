import { library, activityById } from './library';
import { requestSchema, selectionSchema, type Profile, type History, type Activity, type Selection, type Result, type Recommendation } from './schema';
export const versions={prompt:'prompt-v1',schema:'schema-v1',rules:'rules-v1',library:'library-v1'};
export function relevantHistory(p:Profile,h:History[]) {return h.filter(e=>e.profileId===p.id).sort((a,b)=>a.date.localeCompare(b.date));}
export function latestFeedback(p:Profile,h:History[]) {return relevantHistory(p,h).filter(e=>e.feedback.length>0).at(-1);}
export function progressionAllowed(p:Profile,h:History[],category:string) { const events=relevantHistory(p,h).filter(e=>e.status==='completed'&&e.feedback.includes('mastered')&&activityById(e.activityId)?.category===category&&activityById(e.activityId)?.difficulty===2); return events.length>=3&&new Set(events.map(e=>e.date.slice(0,10))).size>=2; }
export function eligible(p:Profile,h:History[]):Activity[] {
 if(p.concern!=='none') return [];
 const latest=latestFeedback(p,h),prev=latest&&activityById(latest.activityId);
 return library.filter(a=>p.age>=a.minAge&&p.age<=a.maxAge&&p.focus.includes(a.category)&&a.minutes<=p.duration&&a.materials.every(m=>p.materials.includes(m))&&a.prerequisites.every(x=>p.abilities.includes(x))&&(a.difficulty<=2||progressionAllowed(p,h,a.category))&&(!(latest?.feedback.includes('struggled')&&prev?.category===a.category)||a.difficulty<=Math.max(1,prev.difficulty-1))&&(!(latest?.feedback.includes('not-interested')&&prev)||a.format!==prev.format));
}
export function expectedReason(a:Activity,p:Profile,h:History[]):Pick<Selection,'reason'|'feedbackId'> {
 const e=latestFeedback(p,h),prev=e&&activityById(e.activityId);
 if(e&&prev){
 if(e.feedback.includes('struggled')&&a.category===prev.category&&a.difficulty<=Math.max(1,prev.difficulty-1))return {reason:'simplify',feedbackId:e.id};
 if(e.feedback.includes('not-interested')&&a.format!==prev.format)return {reason:'variety',feedbackId:e.id};
 if(e.feedback.includes('enjoyed')&&(a.category===prev.category||a.format===prev.format))return {reason:'enjoyed',feedbackId:e.id};
 }
 if(a.difficulty===3&&progressionAllowed(p,h,a.category))return {reason:'progress',feedbackId:null};
 return {reason:p.preferences.includes(a.format)?'practice':'focus',feedbackId:null};
}
export function ranked(p:Profile,h:History[],c=eligible(p,h)):Activity[] {
 const seen=new Set(relevantHistory(p,h).map(e=>e.activityId));
 const score=(a:Activity)=>{const r=expectedReason(a,p,h).reason;return (r==='simplify'?110:r==='variety'?85:r==='enjoyed'?75:0)+(p.preferences.includes(a.format)?15:0)+(a.difficulty===2?8:0)+(a.category==='language'?5:0)-(seen.has(a.id)?25:0);};
 return [...c].sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id));
}
export function mockSelections(p:Profile,h:History[]) {return ranked(p,h).slice(0,3).map(a=>({activityId:a.id,...expectedReason(a,p,h),uncertain:p.abilities.length===0}));}
export function validateSelections(raw:unknown,p:Profile,h:History[]):Selection[] {
 const {selections}=selectionSchema.parse(raw);const pool=eligible(p,h);
 if(new Set(selections.map(s=>s.activityId)).size!==selections.length)throw Error('duplicate_ids');
 for(const s of selections){const a=pool.find(a=>a.id===s.activityId);if(!a)throw Error('ineligible_id');const reason=expectedReason(a,p,h);if(s.reason!==reason.reason||s.feedbackId!==reason.feedbackId)throw Error('unsupported_reason');if(p.abilities.length===0&&!s.uncertain)throw Error('missing_uncertainty');}
 // Whenever a gentler same-skill candidate exists, the first choice must offer it.
 if(pool.some(a=>expectedReason(a,p,h).reason==='simplify')&&selections[0].reason!=='simplify')throw Error('missed_simplification');
 return selections;
}
export function rationale(s:Selection,a:Activity,p:Profile,h:History[]):string {
 const e=s.feedbackId?h.find(e=>e.id===s.feedbackId):undefined; const prior=e&&activityById(e.activityId)?.title;
 const text=s.reason==='simplify'?`You noticed some difficulty with ${prior}. This keeps the same focus with fewer demands.`:s.reason==='variety'?`You marked ${prior} as not interesting. This offers a different play format.`:s.reason==='enjoyed'?`You enjoyed ${prior} together. This follows that interest without a big jump in difficulty.`:s.reason==='progress'?'Several completed observations over multiple days support a small next step; the reported prerequisites are present.':s.reason==='practice'?`A ${a.minutes}-minute ${a.format} activity that fits your selected interests, materials, and reported abilities.`:`Matches your selected focus and fictional age range, using the materials you have.`;
 return text+(s.uncertain?' Abilities are uncertain, so this uses no prerequisites.':'');
}
export interface Provider {name:string;select(p:Profile,h:History[],candidates:Activity[]):Promise<{output:unknown;usage?:{input:number;output:number}}>}
export async function recommend(input:unknown,provider?:Provider):Promise<Result>{
 const started=performance.now(); const {profile:p,history:raw}=requestSchema.parse(input);
 const h=relevantHistory(p,raw);if(new Set(h.map(e=>e.id)).size!==h.length||h.some(e=>!activityById(e.activityId)))throw Error('invalid_history');
 const base={versions,latencyMs:0,model:provider?.name??'deterministic-v1'};
 if(p.concern!=='none')return {...base,recommendations:[],mode:'mock',message:p.concern==='emergency'?'Pause activities. If someone may be in immediate danger, seek urgent professional or emergency assistance now.':'Pause recommendations and discuss your concern with a qualified child-development or healthcare professional. NextStep cannot assess or diagnose.',latencyMs:performance.now()-started};
 const candidates=eligible(p,h);if(!candidates.length)return {...base,recommendations:[],mode:'mock',message:'No eligible activities match these settings. Review available materials, time, and known abilities; we will not guess missing prerequisites.',latencyMs:performance.now()-started};
 let selections=mockSelections(p,h),mode:Result['mode']='mock',message='Simulated recommendations · no AI request was made.',usage:Result['usage'],providerFailure:string|undefined;
 if(provider){try{const out=await provider.select(p,h,candidates);usage=out.usage;selections=validateSelections(out.output,p,h);mode='live';message='Live Gemini ranking · instructions and explanations remain library-grounded.';}catch(error){mode='fallback';providerFailure=error instanceof Error&&['duplicate_ids','ineligible_id','unsupported_reason','missing_uncertainty','missed_simplification'].includes(error.message)?error.message:'provider_or_schema_failure';message='Live AI was unavailable or its response failed validation. Showing a deterministic, non-AI fallback.';}}
 const recommendations:Recommendation[]=selections.map(s=>({...s,rationale:rationale(s,activityById(s.activityId)!,p,h)}));
 return {...base,recommendations,mode,message,usage,providerFailure,latencyMs:performance.now()-started};
}
