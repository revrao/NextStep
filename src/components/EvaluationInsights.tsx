"use client";
import live from "../data/live-evaluation-summary.json";
import mock from "../data/evaluation-summary.json";
import type { Store } from "../lib/storage";
const percent = (n: number | null) =>
  n === null ? "Not measured" : `${(n * 100).toFixed(1)}%`;
const seconds = (n: number | null) =>
  n === null ? "Not measured" : `${(n / 1000).toFixed(2)} s`;
function Card({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="settings-card evaluation-card">
      <p className="eyebrow">{label}</p>
      <strong className="metric-value">{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
export function EvaluationInsights({ store }: { store: Store }) {
  const count = (name: string) =>
    store.events.filter((e) => e.name === name).length;
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">INTERNAL · PRODUCT TEAM & EVALUATION</p>
          <h1>Prototype insights.</h1>
          <p>
            Measured engineering evidence, separate from caregiver activity
            history.
          </p>
        </div>
      </div>
      <div className="notice">
        Internal demonstration view; this label is not an authentication
        boundary. Fictional profiles only. No clinical validation, real-family
        engagement, or retention claims.
      </div>
      <section aria-labelledby="live-evidence">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ACTUAL EXTERNAL PROVIDER REQUESTS</p>
            <h2 id="live-evidence">Live Gemini evidence</h2>
            <p>
              {live.model} ·{" "}
              {live.updatedAt
                ? `Updated ${new Date(live.updatedAt).toLocaleString()}`
                : "No completed requests yet"}
            </p>
          </div>
        </div>
        <div className="insights-grid evaluation-grid">
          <Card
            label="Successful live recommendations"
            value={percent(live.successRate)}
            detail={`${live.successful} passed requests / ${live.attempts} actual evaluation attempts. Fallbacks and failed acceptance checks are excluded from successes.`}
          />
          <Card
            label="Non-AI fallback rate"
            value={percent(live.fallbackRate)}
            detail={`${live.fallbacks} / ${live.attempts} attempts. All failures and retests remain in this denominator.`}
          />
          <Card
            label="Median recommendation latency"
            value={seconds(live.medianLatencyMs)}
            detail={`All ${live.latencySamples} attempts, including failures; excludes deliberate pacing. Prototype target: ≤5 seconds.`}
          />
          <Card
            label="95th percentile latency"
            value={seconds(live.p95LatencyMs)}
            detail="Includes failed attempts and timeouts. Prototype target: ≤15 seconds; small samples are not production performance evidence."
          />
          <Card
            label="Provider token usage"
            value={
              live.attempts
                ? live.tokenUsage.total.toLocaleString()
                : "Not measured"
            }
            detail={`${live.tokenUsage.input.toLocaleString()} input · ${live.tokenUsage.output.toLocaleString()} output · ${live.tokenUsage.thinking.toLocaleString()} thinking. Usage available for ${live.tokenUsage.requestsWithUsage}/${live.attempts} attempts; failed requests may omit usage.`}
          />
          <Card
            label="Estimated evaluation API cost"
            value={
              live.estimatedCostUsd === null
                ? "Not measured"
                : `$${live.estimatedCostUsd.toFixed(2)}`
            }
            detail={`${live.costBasis}. Connectivity smoke usage is recorded separately; no paid tools or providers are invoked.`}
          />
        </div>
        <div className="settings-card">
          <h3>Coverage and acceptance</h3>
          <div className="evaluation-bar">
            <label htmlFor="eval-coverage">
              Unique acceptance cases executed
            </label>
            <meter
              id="eval-coverage"
              min={0}
              max={live.coverage.expected}
              value={live.coverage.executed}
            />
            <span>
              {live.coverage.executed} / {live.coverage.expected}
            </span>
          </div>
          <div className="evaluation-bar">
            <label htmlFor="eval-pass">Latest passing live cases</label>
            <meter
              id="eval-pass"
              min={0}
              max={live.coverage.expected}
              value={live.coverage.passed}
            />
            <span>
              {live.coverage.passed} / {live.coverage.expected}
            </span>
          </div>
          <p>
            {live.coverage.heldoutExecuted} held-out cases executed ·{" "}
            {live.samples.passed}/{live.samples.attempts} sample-profile
            attempts passed · {live.feedbackJourney.passed}/
            {live.feedbackJourney.attempts} feedback-journey steps passed.
          </p>
          <p>
            <strong>
              {live.acceptanceReady
                ? "Technical live acceptance coverage is complete."
                : "Technical live acceptance is incomplete; website live access stays disabled."}
            </strong>{" "}
            Human relevance remains separate and unmeasured.
          </p>
          {live.coverage.failing.length > 0 && (
            <p>Unresolved cases: {live.coverage.failing.join(", ")}.</p>
          )}
          {live.providerModelVersions.length > 0 && (
            <p>
              Provider-reported model versions:{" "}
              {live.providerModelVersions.join(", ")}.
            </p>
          )}
          <p>
            Version bundle: {live.versions.prompt} · {live.versions.schema} ·{" "}
            {live.versions.rules} · {live.versions.library}. Only matching
            model/version results are aggregated. Retests add attempts; latest
            results establish unique case coverage.
          </p>
        </div>
      </section>
      <section
        className="settings-card"
        aria-label="Deterministic guardrail outcomes"
      >
        <h2>Injected guardrail acceptance</h2>
        <p>
          {mock.safety.injectedOutputs.passed}/
          {mock.safety.injectedOutputs.cases} invalid model-output fixtures
          blocked · {mock.safety.inputRejections.passed}/
          {mock.safety.inputRejections.cases} invalid inputs rejected ·{" "}
          {mock.safety.abstentions.passed}/{mock.safety.abstentions.cases}{" "}
          expected abstentions passed.
        </p>
        <p>
          These are local deterministic tests, not actual unsafe Gemini
          responses. Concerns, emergencies, and insufficient eligibility are
          stopped before any provider request.
        </p>
      </section>
      <section aria-labelledby="guardrail-evidence">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              PREVENTION IS DIFFERENT FROM MODEL SUCCESS
            </p>
            <h2 id="guardrail-evidence">Safety & validation checks</h2>
          </div>
        </div>
        <div className="insights-grid">
          <Card
            label="Mock acceptance suite"
            value={`${mock.passed} / ${mock.cases}`}
            detail={`Local deterministic cases; ${mock.fallbacks} deliberately invalid provider fixtures fell back safely. These are not Gemini results.`}
          />
          <Card
            label="Live invalid outputs prevented"
            value={String(live.invalidOutputsPrevented)}
            detail={`${live.transportFailures} transport/availability failures counted separately. Zero observed invalid outputs is not proof of safety.`}
          />
          <Card
            label="Human-reviewed relevance"
            value="Not measured"
            detail="No human ratings have been collected. Automated eligibility or reason-code checks do not establish subjective personalization quality."
          />
          <Card
            label="Clinical validation"
            value="Not performed"
            detail="All library activities and progression rules remain unreviewed demonstration content, restricted to fictional use."
          />
        </div>
      </section>
      <section className="settings-card">
        <h2>Recent live evaluation attempts</h2>
        {live.recentCases.length ? (
          <ul className="event-list">
            {live.recentCases.map((r, i) => (
              <li key={`${r.case}-${i}`}>
                <span>
                  {r.case} · {r.pass ? "passed" : "failed"} · {r.mode}
                </span>
                <small>
                  {seconds(r.latencyMs)}
                  {r.failure ? ` · ${r.failure}` : ""}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No live evaluation attempts recorded.</p>
        )}
        <p>
          Historical failures are retained in the reports even after a passing
          recheck. This is a bounded engineering evaluation, not a
          representative field trial.
        </p>
      </section>
      <section className="settings-card">
        <h2>Local fictional-profile interactions</h2>
        <p>
          {count("recommendation_requested")} requests ·{" "}
          {count("activity_completed")} completions ·{" "}
          {count("feedback_submitted")} feedback submissions ·{" "}
          {count("ai_request_failed")} errors or fallbacks.
        </p>
        <p>
          Events belong to this browser, are capped at 1,000, and can be
          deleted. They are separate from the evaluation dataset. Retention,
          actual family conversion, satisfaction, and commercial performance:
          insufficient data.
        </p>
        <h3>Recent local events</h3>
        {store.events.length ? (
          <ul className="event-list">
            {[...store.events]
              .reverse()
              .slice(0, 12)
              .map((e) => (
                <li key={e.id}>
                  <span>{e.name.replaceAll("_", " ")}</span>
                  <small>
                    {new Date(e.date).toLocaleTimeString()}
                    {e.mode ? ` · ${e.mode}` : ""}
                  </small>
                </li>
              ))}
          </ul>
        ) : (
          <p>No local interactions recorded.</p>
        )}
      </section>
    </div>
  );
}
