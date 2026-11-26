import { z } from "zod";
import { profileSchema, historySchema, reasonCodes } from "./schema";
export const eventNames = [
  "onboarding_started",
  "profile_created",
  "profile_updated",
  "recommendation_requested",
  "recommendation_generated",
  "activity_viewed",
  "activity_attempted",
  "activity_completed",
  "feedback_submitted",
  "followup_requested",
  "recommendation_skipped",
  "safety_guardrail_triggered",
  "ai_request_failed",
] as const;
const recommendation = z.object({
  activityId: z.string(),
  rationale: z.string().max(400),
  reason: z.enum(reasonCodes),
  feedbackId: z.string().nullable(),
  uncertain: z.boolean(),
});
const result = z.object({
  recommendations: z.array(recommendation).max(3),
  mode: z.enum(["mock", "live", "fallback"]),
  message: z.string(),
  latencyMs: z.number(),
  model: z.string(),
  usage: z
    .object({
      input: z.number(),
      output: z.number(),
      total: z.number().optional(),
      thinking: z.number().optional(),
      cached: z.number().optional(),
    })
    .optional(),
  providerModelVersion: z.string().optional(),
  providerFailure: z.string().optional(),
  versions: z.object({
    prompt: z.string(),
    schema: z.string(),
    rules: z.string(),
    library: z.string(),
  }),
});
export const storeSchema = z.object({
  version: z.literal(1),
  profiles: z.array(profileSchema).max(10),
  active: z.string().nullable(),
  history: z.array(historySchema).max(300),
  results: z.record(z.string(), result),
  events: z
    .array(
      z.object({
        id: z.string(),
        name: z.enum(eventNames),
        date: z.iso.datetime(),
        profileId: z.string().nullable(),
        mode: z.string().optional(),
        latencyMs: z.number().optional(),
      }),
    )
    .max(1000),
});
export type Store = z.infer<typeof storeSchema>;
export const emptyStore: Store = {
  version: 1,
  profiles: [],
  active: null,
  history: [],
  results: {},
  events: [],
};
export const STORAGE_KEY = "nextstep-demo-v1";
