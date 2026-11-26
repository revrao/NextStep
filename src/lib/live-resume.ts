import type { EvalBatch, EvalRow } from "./evaluation-report";
export function pendingLiveCases(
  cases: { id: string }[],
  batches: EvalBatch[],
  model: string,
  versions: Record<string, string>,
) {
  const latest = new Map<string, EvalRow>();
  const rows = batches
    .filter(
      (b) =>
        b.mode === "live" &&
        (b.scope ?? "acceptance") === "acceptance" &&
        (!b.model || b.model === model) &&
        Object.entries(versions).every(([k, v]) => b.versions[k] === v),
    )
    .flatMap((b) => b.results)
    .filter((r) => !r.model || r.model === model)
    .sort((a, b) => a.executionDate.localeCompare(b.executionDate));
  for (const row of rows) latest.set(row.case, row);
  const indexed = cases.map((c, offset) => ({
    ...c,
    offset,
    previous: latest.get(c.id),
  }));
  return [
    ...indexed.filter((c) => !c.previous),
    ...indexed.filter(
      (c) =>
        c.previous && !(c.previous.pass && c.previous.resultMode === "live"),
    ),
  ];
}
export function retry503(
  category: string | null,
  attempt: number,
  sessionRetries: number,
) {
  return category === "provider_http_503" && attempt < 2 && sessionRetries < 6;
}
export const retryDelayMs = (attempt: number) => 30000 * 2 ** attempt;
