# Local metrics and event contract

The events schema in `src/lib/storage.ts` holds timestamp, event ID, fictional profile ID, event name and optional actual mode/latency. It retains at most 1,000 events and 300 history entries per browser. Data deletion/reset removes corresponding evidence, so this is neither platform telemetry nor a durable longitudinal dataset. Demo profile interactions are actual local interactions with synthetic subjects, not real-family outcomes.

## North Star proposal
Weekly completed recommended activities per active family. Production numerator: completed recommended activity events in a trailing seven-day window. Denominator: distinct consenting families actively requesting recommendations in that window. The current UI uses local fictional profile IDs as a demonstration proxy; it cannot identify actual families. It does not establish commercial value.

## Available event-based measures
- Onboarding completion: custom `profile_created` events / `onboarding_started` events, over all retained local events; preconfigured samples excluded. Restarting or editing flows affects interpretation.
- Request-to-completion ratio: `activity_completed` / `recommendation_generated`, over retained events. This is an event ratio, not cohort conversion; may exceed 100%.
- Feedback event ratio: `feedback_submitted` / `activity_completed`, over retained events; attempts can also have feedback, so it may exceed 100%.
- Repeat request ratio: `followup_requested` / `recommendation_requested`, over retained events. Means a profile with prior feedback requested again, not week-one retention.
- Override proxy: `recommendation_skipped` / recommendations shown (sum of stored recommendation history entries in window). Skip is not equivalent to a clinical override; counts are incomplete after retention caps.
- API failure ratio: `ai_request_failed` / `recommendation_requested`, over retained events. Includes blocked live requests and invalid-output fallback; does not isolate provider uptime. UI shows counts.
- Latency: measured recommendation route engine duration attached to generation events; excludes network/render time. Evals report independent wall-clock median/p95. Mock latency is not Gemini latency.
- Eval pass rate: passed applicable cases / executed cases per versioned report. Grounding violation rate and raw provider failures must be distinguished from violations prevented before rendering. Fallbacks count as failed live model recommendations.

No valid denominator displays invented percentages: UI says insufficient data. Week-one retention, unique active real families, subjective relevance, human override rate and verified AI cost per successful recommendation remain unmeasured. Production recommendation-to-completion conversion would require attributing a unique activity completion to a recommendation impression and defining cohorts; the local event ratio is not that metric.

## Event triggers
`onboarding_started`, `profile_created`, `profile_updated`, `recommendation_requested`, `recommendation_generated`, `activity_viewed`, `activity_attempted`, `activity_completed`, `feedback_submitted`, `followup_requested`, `recommendation_skipped`, `safety_guardrail_triggered`, `ai_request_failed` fire on the corresponding deliberate UI actions or response outcomes. No events are automatically uploaded. No current dashboard claims retention, satisfaction, revenue, professional validation, or live-model pass rates.
