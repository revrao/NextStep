import { ProviderError, type TokenUsage } from "./provider-error";
import { systemPrompt } from "../../prompts/system-v1";
import { expectedReason, relevantHistory, type Provider } from "./engine";
export function geminiProvider(config: {
  key: string;
  model: string;
  fetcher?: typeof fetch;
}): Provider {
  return {
    name: config.model,
    async select(p, h, candidates) {
      const context = {
        profile: {
          age: p.age,
          focus: p.focus,
          abilities: p.abilities,
          duration: p.duration,
          materials: p.materials,
          preferences: p.preferences,
        },
        uncertaintyRequired: p.abilities.length === 0,
        feedback: relevantHistory(p, h)
          .filter((e) => e.feedback.length)
          .slice(-15)
          .map((e) => ({
            id: e.id,
            activityId: e.activityId,
            status: e.status,
            feedback: e.feedback,
          })),
        candidates: candidates.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          difficulty: a.difficulty,
          format: a.format,
          minutes: a.minutes,
          ...{
            allowedReason: expectedReason(a, p, h).reason,
            feedbackId: expectedReason(a, p, h).feedbackId,
          },
        })),
      };
      const response = await (config.fetcher ?? fetch)(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": config.key,
          },
          signal: AbortSignal.timeout(12000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [
              { role: "user", parts: [{ text: JSON.stringify(context) }] },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1200,
              responseMimeType: "application/json",
              responseJsonSchema: {
                type: "object",
                properties: {
                  selections: {
                    type: "array",
                    minItems: 1,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        activityId: {
                          type: "string",
                          enum: candidates.map((a) => a.id),
                        },
                        reason: {
                          type: "string",
                          enum: [
                            "focus",
                            "practice",
                            "enjoyed",
                            "simplify",
                            "variety",
                            "progress",
                          ],
                        },
                        feedbackId: { type: ["string", "null"] },
                        uncertain: { type: "boolean" },
                      },
                      required: [
                        "activityId",
                        "reason",
                        "feedbackId",
                        "uncertain",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["selections"],
                additionalProperties: false,
              },
            },
          }),
        },
      );
      if (!response.ok)
        throw new ProviderError(`provider_http_${response.status}`);
      const data = await response.json();
      const usage: TokenUsage | undefined = data.usageMetadata
        ? {
            input: data.usageMetadata.promptTokenCount ?? 0,
            output: data.usageMetadata.candidatesTokenCount ?? 0,
            ...(data.usageMetadata.totalTokenCount !== undefined
              ? { total: data.usageMetadata.totalTokenCount }
              : {}),
            ...(data.usageMetadata.thoughtsTokenCount !== undefined
              ? { thinking: data.usageMetadata.thoughtsTokenCount }
              : {}),
            ...(data.usageMetadata.cachedContentTokenCount !== undefined
              ? { cached: data.usageMetadata.cachedContentTokenCount }
              : {}),
          }
        : undefined;
      if (data.candidates?.[0]?.finishReason !== "STOP")
        throw new ProviderError("provider_incomplete", usage);
      const text = data.candidates[0].content?.parts
        ?.filter((x: { thought?: boolean }) => !x.thought)
        .map((x: { text?: string }) => x.text ?? "")
        .join("");
      if (!text || text.length > 16000)
        throw new ProviderError("provider_invalid_body", usage);
      let output: unknown;
      try {
        output = JSON.parse(text);
      } catch {
        throw new ProviderError("provider_invalid_json", usage);
      }
      return {
        output,
        usage,
        modelVersion:
          typeof data.modelVersion === "string" ? data.modelVersion : undefined,
      };
    },
  };
}
