export type TokenUsage = {
  input: number;
  output: number;
  total?: number;
  thinking?: number;
  cached?: number;
};
// Only enumerated/sanitized diagnostic codes cross the provider boundary; never raw provider bodies.
export class ProviderError extends Error {
  constructor(
    public readonly code: string,
    public readonly usage?: TokenUsage,
  ) {
    super(code);
    this.name = "ProviderError";
  }
}
export const outputFailureCodes = new Set([
  "schema_validation_failed",
  "duplicate_ids",
  "ineligible_id",
  "unsupported_reason",
  "missing_uncertainty",
  "missed_simplification",
  "provider_invalid_json",
  "provider_incomplete",
  "provider_invalid_body",
]);
