"use client";
import { useState } from "react";
import { Check, Sprout } from "lucide-react";
import {
  abilities,
  abilityLabels,
  categories,
  labels,
  materials,
  preferences,
  profileSchema,
  type Profile,
} from "../lib/schema";
import { samples } from "../data/profiles";
export function Onboarding({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Profile;
  onSave: (p: Profile) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0),
    [p, setP] = useState<Profile>(
      initial ?? {
        ...samples[0],
        id: crypto.randomUUID(),
        nickname: "",
        abilities: [],
        materials: [],
        preferences: [],
      },
    ),
    [ack, setAck] = useState(!!initial),
    [error, setError] = useState("");
  function toggle(
    key: "focus" | "abilities" | "materials" | "preferences",
    value: string,
  ) {
    setP((old) => ({
      ...old,
      [key]: (old[key] as string[]).includes(value)
        ? old[key].filter((v) => v !== value)
        : [...old[key], value],
    }));
  }
  function next() {
    setError("");
    if (
      step === 0 &&
      (!ack ||
        !p.nickname.trim() ||
        p.age < 0 ||
        p.age > 71 ||
        !Number.isInteger(p.age))
    ) {
      setError(
        "Use a fictional nickname, an age from 0 to 71 months, and acknowledge demo use.",
      );
      return;
    }
    if (step === 1 && !p.focus.length) {
      setError("Select at least one focus area.");
      return;
    }
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    const parsed = profileSchema.safeParse(p);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    onSave(parsed.data);
  }
  return (
    <main className="onboarding">
      <button className="text-button" onClick={onCancel}>
        Back to NextStep
      </button>
      <div className="onboard-card">
        <div className="brand-mark">
          <Sprout size={28} />
        </div>
        <p className="eyebrow">A LITTLE CONTEXT GOES A LONG WAY</p>
        <h1>
          {initial
            ? "Make room for change."
            : "Let’s start with your little one."}
        </h1>
        <p className="muted">
          A few simple details help us find a thoughtful next step.
        </p>
        <div className="stepper" aria-label={`Step ${step + 1} of 3`}>
          {["A little introduction", "What feels right", "Make it yours"].map(
            (s, i) => (
              <span className={i <= step ? "active" : ""} key={s}>
                {i < step ? <Check size={15} /> : i + 1}
                <small>{s}</small>
              </span>
            ),
          )}
        </div>
        {step === 0 && (
          <div className="form-stack">
            <div className="notice">
              Fictional profiles only. This educational prototype is unreviewed
              and must not guide real child-development decisions.
            </div>
            <label>
              Fictional nickname
              <input
                value={p.nickname}
                maxLength={24}
                placeholder="e.g. Milo"
                onChange={(e) => setP({ ...p, nickname: e.target.value })}
              />
            </label>
            <label>
              Age in months
              <input
                type="number"
                min="0"
                max="71"
                value={Number.isNaN(p.age) ? "" : p.age}
                onChange={(e) =>
                  setP({
                    ...p,
                    age: e.target.value === "" ? NaN : Number(e.target.value),
                  })
                }
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
              />
              I will use fictional, non-identifying information only.
            </label>
          </div>
        )}
        {step === 1 && (
          <div className="form-stack">
            <fieldset>
              <legend>What would you like to explore?</legend>
              <div className="choices">
                {categories.map((c) => (
                  <button
                    type="button"
                    aria-pressed={p.focus.includes(c)}
                    className={
                      p.focus.includes(c) ? "choice selected" : "choice"
                    }
                    key={c}
                    onClick={() => toggle("focus", c)}
                  >
                    {labels[c]}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>
                What have you noticed? <small>Leave blank if unsure.</small>
              </legend>
              <div className="choices">
                {abilities.map((a) => (
                  <button
                    type="button"
                    aria-pressed={p.abilities.includes(a)}
                    className={
                      p.abilities.includes(a) ? "choice selected" : "choice"
                    }
                    key={a}
                    onClick={() => toggle("abilities", a)}
                  >
                    {abilityLabels[a]}
                  </button>
                ))}
              </div>
              <button
                className="text-button"
                onClick={() => setP({ ...p, abilities: [] })}
              >
                I’m not sure yet
              </button>
            </fieldset>
          </div>
        )}
        {step === 2 && (
          <div className="form-stack">
            <fieldset>
              <legend>A comfortable amount of time</legend>
              <div className="choices">
                {([5, 10, 15] as const).map((d) => (
                  <button
                    aria-pressed={p.duration === d}
                    className={p.duration === d ? "choice selected" : "choice"}
                    key={d}
                    onClick={() => setP({ ...p, duration: d })}
                  >
                    {d} minutes
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>
                What’s on hand? <small>Nothing selected is okay.</small>
              </legend>
              <div className="choices">
                {materials.map((m) => (
                  <button
                    aria-pressed={p.materials.includes(m)}
                    className={
                      p.materials.includes(m) ? "choice selected" : "choice"
                    }
                    key={m}
                    onClick={() => toggle("materials", m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>
                Favorite ways to play <small>Optional</small>
              </legend>
              <div className="choices">
                {preferences.map((m) => (
                  <button
                    aria-pressed={p.preferences.includes(m)}
                    className={
                      p.preferences.includes(m) ? "choice selected" : "choice"
                    }
                    key={m}
                    onClick={() => toggle("preferences", m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </fieldset>
            <label>
              Any concern to demonstrate?
              <select
                value={p.concern}
                onChange={(e) =>
                  setP({ ...p, concern: e.target.value as Profile["concern"] })
                }
              >
                <option value="none">No concern</option>
                <option value="development">
                  Developmental concern or diagnostic request
                </option>
                <option value="emergency">Possible immediate emergency</option>
              </select>
            </label>
          </div>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="onboard-actions">
          {step > 0 && (
            <button
              className="button secondary"
              onClick={() => setStep(step - 1)}
            >
              Previous
            </button>
          )}
          <button className="button" onClick={next}>
            {step === 2
              ? initial
                ? "Save profile"
                : "Create fictional profile"
              : "Continue"}
          </button>
        </div>
      </div>
      <p className="footnote">
        No accounts. No clinical scores. Just a little space to explore.
      </p>
    </main>
  );
}
