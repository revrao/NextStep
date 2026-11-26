# Scope and architecture

## Product strategy implemented
The intended segment is caregivers continuing home practice after helpful developmental counseling, initially around Simi Valley. The prototype tests whether observations make the next eligible activity feel more relevant, enough to encourage another session. Geography is not restricted. Core user stories: create a fictional profile; find feasible play; understand why; record compatible feedback; request adapted ideas; review and reset history.

A real launch would first recruit through consenting local counselor partnerships and test repeated use in a professionally reviewed, privacy-approved pilot. This is a proposed go-to-market path, not validated demand or a claimed partnership.

## Decisions
Next.js App Router serves the single interactive application at `/` and the Node route `/api/recommend`. Hash navigation supports browser back/forward and refreshes without extra infrastructure. React state is serialized through a versioned Zod browser-storage boundary. Separate fictional profiles share a browser but not activity feedback. There is no account system.

The 40-item JSON library is independent of evaluation fixtures and local usage records. Eligibility checks age, selected category, materials, duration, explicit prerequisites, and conservative difficulty caps. Unknown abilities are empty, never inferred. A concern abstains before provider invocation.

The deterministic adapter ranks candidates based on feedback, preferences, and novelty. The Gemini adapter receives eligible candidate metadata plus minimized structured fictional context, asks for JSON IDs/reason codes, and runs strict validation. Rationale templates reference verified local feedback events. Instructions always come from the library. Provider transport is injected for tests. Future providers can implement the `Provider` interface without changing the caregiver UI.

The most recent structured feedback governs simplification or disinterest. Struggle limits same-category difficulty to one level lower (floor 1), and a simpler same-skill candidate must lead when available. Disinterest excludes the prior format. Enjoyment favors related category/format without lifting the difficulty cap. Level 3 needs >=3 completed level-2 mastery events in that category across >=2 dates plus explicit prerequisites. All feedback stays caregiver-reported, not clinical measurement.

Mock, live, fallback and abstention are displayed explicitly. No automatic AI request runs on page load. Recommendations are reused across refreshes until profile changes or deliberate regeneration. Client request locking and server timeout prevent common duplicate/cascade problems; no provider retries. Server access checks and deployment protection are required for live use; in-memory throttling is only supplemental and not durable across Vercel instances.

Pinned package versions and webpack are used for repeatable builds; Turbopack's local worker bind failed in the execution sandbox. No static export: the API needs server execution. SVG illustrations are repo-native and require no external asset services.

## Deliberate omissions
No diagnostic chat, medical advice, real-family enrollment, production auth, subscription billing, custom training, vector database, video collection, automated prompt learning, or third-party tracking. Optional simulated caregiver roles were omitted to avoid misleading security implications. Metrics remain a secondary developer view.
