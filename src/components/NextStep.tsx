"use client";
import { useEffect, useRef, useState } from "react";
import {
  Sprout,
  LayoutDashboard,
  BookOpen,
  History as HistoryIcon,
  Settings,
  Sparkles,
  Clock3,
  Check,
  ChevronRight,
  Heart,
  ShieldCheck,
  BarChart3,
  RefreshCw,
  X,
  Leaf,
  MessageCircle,
  Blocks,
  Footprints,
  Shapes,
  Smile,
  CircleHelp,
  Menu,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Onboarding } from "./Onboarding";
import { Illustration } from "./Illustration";
import { EvaluationInsights } from "./EvaluationInsights";
import { samples } from "../data/profiles";
import { library, activityById } from "../lib/library";
import {
  categories,
  labels,
  observations,
  type Profile,
  type Activity,
  type Result,
  type History,
  type Category,
} from "../lib/schema";
import {
  emptyStore,
  storeSchema,
  STORAGE_KEY,
  type Store,
  type eventNames,
} from "../lib/storage";
import { eligible } from "../lib/engine";
const icons: Record<Category, LucideIcon> = {
  language: MessageCircle,
  "fine-motor": Blocks,
  "gross-motor": Footprints,
  cognitive: Shapes,
  social: Smile,
};
type View =
  | "home"
  | "dashboard"
  | "library"
  | "history"
  | "settings"
  | "insights"
  | "onboarding"
  | "privacy";
function formatAge(months: number) {
  return months < 24
    ? `${months} months`
    : `${Math.floor(months / 12)} years${months % 12 ? `, ${months % 12} months` : ""}`;
}
export function NextStep() {
  const [store, setStore] = useState<Store>(emptyStore),
    [ready, setReady] = useState(false),
    [view, setView] = useState<View>("home"),
    [editing, setEditing] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [storageError, setStorageError] = useState(""),
    [mode, setMode] = useState<"mock" | "live">("mock"),
    [code, setCode] = useState(""),
    [selected, setSelected] = useState<Activity | null>(null),
    [feedback, setFeedback] = useState<string[]>([]),
    [status, setStatus] = useState<"attempted" | "completed">("completed"),
    [saved, setSaved] = useState(false),
    [filter, setFilter] = useState("all"),
    [menu, setMenu] = useState(false),
    [confirm, setConfirm] = useState<"all" | "history" | null>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    confirmDialog = useRef<HTMLDialogElement>(null),
    inFlight = useRef(false);
  const profile = store.profiles.find((p) => p.id === store.active),
    result = profile ? store.results[profile.id] : undefined;
  const history = store.history.filter((h) => h.profileId === profile?.id),
    completed = history.filter((h) => h.status === "completed");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = storeSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setStore(parsed.data);
        else
          setStorageError(
            "Saved data could not be read. You can reset local data in Settings.",
          );
      }
    } catch {
      setStorageError(
        "Browser storage is unavailable. Changes will last only for this session.",
      );
    }
    setReady(true);
    const hash = location.hash.slice(1);
    if (
      [
        "dashboard",
        "library",
        "history",
        "settings",
        "insights",
        "privacy",
      ].includes(hash)
    )
      setView(hash as View);
    const onHash = () => {
      const h = location.hash.slice(1) || "home";
      if (
        [
          "home",
          "dashboard",
          "library",
          "history",
          "settings",
          "insights",
          "privacy",
        ].includes(h)
      )
        setView(h as View);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      setStorageError(
        "Local storage is full or unavailable. Your current session still works; export is not provided.",
      );
    }
  }, [store, ready]);
  useEffect(() => {
    if (selected) {
      dialog.current?.showModal();
      setFeedback([]);
      setStatus("completed");
      setSaved(false);
    } else dialog.current?.close();
  }, [selected]);
  useEffect(() => {
    if (confirm) confirmDialog.current?.showModal();
    else confirmDialog.current?.close();
  }, [confirm]);
  function navigate(next: View) {
    setView(next);
    setMenu(false);
    setError("");
    if (next !== "onboarding") location.hash = next === "home" ? "" : next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function event(
    name: (typeof eventNames)[number],
    id = store.active,
    extra: { mode?: string; latencyMs?: number } = {},
  ) {
    setStore((s) => ({
      ...s,
      events: [
        ...s.events,
        {
          id: crypto.randomUUID(),
          name,
          date: new Date().toISOString(),
          profileId: id,
          ...extra,
        },
      ].slice(-1000),
    }));
  }
  function create(p: Profile) {
    setStore((s) => ({
      ...s,
      profiles: [...s.profiles.filter((v) => v.id !== p.id), p].slice(-10),
      active: p.id,
      results: Object.fromEntries(
        Object.entries(s.results).filter(([id]) => id !== p.id),
      ),
    }));
    event(editing ? "profile_updated" : "profile_created", p.id);
    setEditing(false);
    navigate("dashboard");
  }
  function demo(p = samples[0]) {
    setStore((s) => ({
      ...s,
      profiles: [
        ...s.profiles.filter((v) => v.id !== p.id),
        structuredClone(p),
      ],
      active: p.id,
      results: Object.fromEntries(
        Object.entries(s.results).filter(([id]) => id !== p.id),
      ),
    }));
    event("profile_created", p.id);
    navigate("dashboard");
  }
  async function generate() {
    if (!profile || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    event("recommendation_requested");
    if (history.some((h) => h.feedback.length)) event("followup_requested");
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(mode === "live" ? { "x-demo-access": code } : {}),
        },
        body: JSON.stringify({
          profile,
          history: history.map((h) => ({ ...h, rationale: "" })),
          mode,
        }),
        signal: AbortSignal.timeout(18000),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error ?? "Unable to request recommendations.");
      const next = data as Result;
      const date = new Date().toISOString();
      setStore((s) => ({
        ...s,
        results: { ...s.results, [profile.id]: next },
        history: [
          ...s.history,
          ...next.recommendations.map((r) => ({
            id: crypto.randomUUID(),
            profileId: profile.id,
            activityId: r.activityId,
            date,
            status: "recommended" as const,
            feedback: [],
            rationale: r.rationale,
            mode: next.mode,
          })),
        ].slice(-300),
      }));
      event(
        next.recommendations.length
          ? "recommendation_generated"
          : "safety_guardrail_triggered",
        profile.id,
        { mode: next.mode, latencyMs: next.latencyMs },
      );
      if (next.mode === "fallback") event("ai_request_failed");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Request failed. Try again in mock mode.",
      );
      event("ai_request_failed");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  function openActivity(a: Activity) {
    setSelected(a);
    event("activity_viewed");
  }
  function submitFeedback() {
    if (!selected || !profile) return;
    const recommendation = result?.recommendations.find(
      (r) => r.activityId === selected.id,
    );
    const record: History = {
      id: crypto.randomUUID(),
      profileId: profile.id,
      activityId: selected.id,
      date: new Date().toISOString(),
      status,
      feedback: feedback as History["feedback"],
      rationale:
        recommendation?.rationale ??
        "Selected by the caregiver from the eligible library.",
      mode: recommendation ? result!.mode : "mock",
    };
    setStore((s) => ({ ...s, history: [...s.history, record].slice(-300) }));
    event(status === "completed" ? "activity_completed" : "activity_attempted");
    if (feedback.length) event("feedback_submitted");
    setSaved(true);
  }
  function toggleFeedback(value: string) {
    setFeedback((old) =>
      old.includes(value)
        ? old.filter((v) => v !== value)
        : [
            ...old.filter(
              (v) =>
                !(
                  (value === "mastered" && v === "struggled") ||
                  (value === "struggled" && v === "mastered") ||
                  (value === "enjoyed" && v === "not-interested") ||
                  (value === "not-interested" && v === "enjoyed")
                ),
            ),
            value,
          ],
    );
  }
  function skip(a: Activity) {
    if (!profile) return;
    const r = result?.recommendations.find((r) => r.activityId === a.id);
    setStore((s) => ({
      ...s,
      history: [
        ...s.history,
        {
          id: crypto.randomUUID(),
          profileId: profile.id,
          activityId: a.id,
          date: new Date().toISOString(),
          status: "skipped" as const,
          feedback: [],
          rationale: r?.rationale ?? "Caregiver skipped this recommendation.",
          mode: result?.mode ?? "mock",
        },
      ].slice(-300),
      results: result
        ? {
            ...s.results,
            [profile.id]: {
              ...result,
              recommendations: result.recommendations.filter(
                (r) => r.activityId !== a.id,
              ),
            },
          }
        : s.results,
    }));
    event("recommendation_skipped");
  }
  const navItems: { id: View; label: string; icon: LucideIcon }[] = [
    { id: "dashboard", label: "Your day", icon: LayoutDashboard },
    { id: "library", label: "Activity library", icon: BookOpen },
    { id: "history", label: "Your journey", icon: HistoryIcon },
    { id: "settings", label: "Profile & settings", icon: Settings },
  ];
  const start = () => {
    setEditing(false);
    event("onboarding_started");
    navigate("onboarding");
  };
  if (!ready)
    return (
      <div className="loading-page">
        <Sprout />
        <p>Making room for small steps…</p>
      </div>
    );
  if (view === "onboarding")
    return (
      <Onboarding
        initial={editing ? profile : undefined}
        onSave={create}
        onCancel={() => navigate(profile ? "settings" : "home")}
      />
    );
  const appView = view !== "home" && view !== "privacy";
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {appView ? (
        <aside className="sidebar">
          <a className="brand" href="#" onClick={() => navigate("home")}>
            <span className="brand-mark">
              <Sprout />
            </span>
            NextStep<span className="brand-period">.</span>
          </a>
          <p className="brand-tagline">A little play. A little possibility.</p>
          <button
            className="mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
          <div className={menu ? "nav-area open" : "nav-area"}>
            <p className="nav-label">GROW TOGETHER</p>
            <nav>
              {navItems.map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={() => navigate(n.id)}
                  className={view === n.id ? "nav-link active" : "nav-link"}
                >
                  <n.icon size={19} />
                  {n.label}
                  {view === n.id && <span className="nav-dot" />}
                </a>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="gentle-note">
                <Leaf size={21} />
                <p>
                  Every child’s journey
                  <br />
                  has its own rhythm.
                </p>
                <span>There’s no race to the next step.</span>
              </div>
              <a
                href="#insights"
                className={view === "insights" ? "nav-link active" : "nav-link"}
                onClick={() => navigate("insights")}
              >
                <BarChart3 size={18} />
                Team insights
              </a>
              <a
                href="#privacy"
                className="nav-link"
                onClick={() => navigate("privacy")}
              >
                <ShieldCheck size={18} />
                Safety & privacy
              </a>
              <div className="demo-label">
                <span className="demo-dot" />
                Educational prototype
              </div>
            </div>
          </div>
        </aside>
      ) : (
        <header className="landing-nav">
          <a className="brand" href="#" onClick={() => navigate("home")}>
            <span className="brand-mark">
              <Sprout />
            </span>
            NextStep<span className="brand-period">.</span>
          </a>
          <nav>
            <a href="#how-it-works">How it works</a>
            <a href="#privacy" onClick={() => navigate("privacy")}>
              Safety & privacy
            </a>
            <button
              className="button small secondary"
              onClick={() => (profile ? navigate("dashboard") : demo())}
            >
              Try the demo
            </button>
          </nav>
        </header>
      )}
      <div className={appView ? "app-shell" : "public-shell"}>
        {appView && (
          <header className="topbar">
            <div>
              <span className="breadcrumb">Your little moments</span>
              <ChevronRight size={14} />
              <span>
                {navItems.find((n) => n.id === view)?.label ?? "Team insights"}
              </span>
            </div>
            <div>
              <span className="mode-pill">
                <Sparkles size={13} />
                {mode === "mock"
                  ? "Demo mode · simulated"
                  : "Live mode requested"}
              </span>
              {profile && (
                <button
                  className="profile-mini"
                  onClick={() => navigate("settings")}
                >
                  <span>{profile.nickname[0]}</span>
                  <b>{profile.nickname}’s space</b>
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </header>
        )}
        {storageError && (
          <div role="status" className="storage-warning">
            {storageError}
          </div>
        )}
        <main id="main-content" tabIndex={-1}>
          {view === "home" && (
            <>
              <section className="landing-hero">
                <div>
                  <p className="eyebrow">
                    <span className="tiny-leaf">✦</span> LITTLE MOMENTS,
                    THOUGHTFULLY CHOSEN
                  </p>
                  <h1>
                    Small steps.
                    <br />
                    <em>Meaningful</em>
                    <br />
                    progress.
                  </h1>
                  <p className="hero-description">
                    A little less searching. A little more connecting. Find
                    simple play activities that meet your little one where they
                    are—and grow with what you notice.
                  </p>
                  <div className="hero-actions">
                    <button className="button" onClick={start}>
                      Find your next step
                    </button>
                    <button className="text-button" onClick={() => demo()}>
                      Explore with fictional Milo <ChevronRight size={16} />
                    </button>
                  </div>
                  <p className="subtle">
                    <ShieldCheck size={16} />
                    Fictional data only · No account needed · Ages 0–5
                  </p>
                </div>
                <div className="hero-art">
                  <span className="art-kicker">
                    GOOD THINGS GROW IN LITTLE MOMENTS
                  </span>
                  <Illustration />
                  <div className="floating-note">
                    <span className="circle-icon">
                      <Heart size={19} />
                    </span>
                    <div>
                      A little play, chosen for you.
                      <small>Simple materials. Your own pace.</small>
                    </div>
                  </div>
                  <span className="art-footnote">
                    Room to explore. Space to grow.
                  </span>
                </div>
              </section>
              <section className="landing-strip">
                <span>Made for the moments between professional visits.</span>
                <p>
                  A supplement to developmental guidance, with a thoughtful next
                  activity and a place to notice what works.
                </p>
              </section>
              <section id="how-it-works" className="how-section">
                <p className="eyebrow">A SMALL, SUPPORTIVE CYCLE</p>
                <h2>Less guesswork. More together time.</h2>
                <div className="how-grid">
                  {[
                    {
                      icon: Sprout,
                      title: "Start with your child",
                      text: "Share a fictional profile, a few interests, and the materials on hand.",
                    },
                    {
                      icon: BookOpen,
                      title: "Find a little inspiration",
                      text: "Explore three eligible activities with clear steps and a reason for each choice.",
                    },
                    {
                      icon: Heart,
                      title: "Let your observations lead",
                      text: "Tell us what felt fun or difficult. The next suggestions adapt, gently.",
                    },
                  ].map((item) => (
                    <article key={item.title}>
                      <span className="circle-icon">
                        <item.icon />
                      </span>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </article>
                  ))}
                </div>
              </section>
              <section className="sample-section">
                <div>
                  <p className="eyebrow">TAKE A LITTLE LOOK AROUND</p>
                  <h2>Meet our fictional families.</h2>
                  <p>
                    Try a complete journey without entering any personal
                    information.
                  </p>
                </div>
                <div className="sample-grid">
                  {samples.map((p, i) => (
                    <button
                      className={`sample-card sample-${i}`}
                      key={p.id}
                      onClick={() => demo(p)}
                    >
                      <span className="avatar">{p.nickname[0]}</span>
                      <span>
                        <strong>{p.nickname}</strong>
                        <small>{formatAge(p.age)} · fictional profile</small>
                      </span>
                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
          {view === "dashboard" &&
            (!profile ? (
              <Empty
                title="A little context, a thoughtful start."
                text="Create a fictional profile or meet Milo to explore the complete demo."
                action="Meet fictional Milo"
                onClick={() => demo()}
              />
            ) : (
              <div className="page-content">
                <div className="page-heading">
                  <div>
                    <p className="eyebrow">LITTLE MOMENTS ADD UP</p>
                    <h1>
                      A little play. A lot of possibility
                      <span className="accent">.</span>
                    </h1>
                    <p>
                      A thoughtful next step for {profile.nickname}, at your own
                      pace.
                    </p>
                  </div>
                  <span className="today-label">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                    }).format(new Date())}
                  </span>
                </div>
                <section className="welcome-card">
                  <div className="welcome-copy">
                    <span className="light-eyebrow">
                      <Sprout size={15} /> MADE FOR YOUR LITTLE ONE
                    </span>
                    <h2>
                      Meet {profile.nickname} where
                      <br />
                      they are today.
                    </h2>
                    <p>
                      Simple activities. Familiar materials. A little room
                      <br className="desktop-break" /> to discover something
                      together.
                    </p>
                    <div className="welcome-profile">
                      <span className="avatar">{profile.nickname[0]}</span>
                      <span>
                        <strong>{profile.nickname}’s little world</strong>
                        <small>
                          {formatAge(profile.age)} · {profile.duration} minutes
                          at a time
                        </small>
                      </span>
                      <button
                        aria-label="Edit profile"
                        onClick={() => {
                          setEditing(true);
                          navigate("onboarding");
                        }}
                      >
                        <Settings size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="welcome-art">
                    <Illustration />
                    <span>GROWTH HAPPENS IN EVERYDAY MOMENTS</span>
                  </div>
                </section>
                <section className="recommend-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">A LITTLE INSPIRATION FOR TODAY</p>
                      <h2>
                        Picked for {profile.nickname}
                        <span className="flower">✳</span>
                      </h2>
                      <p>
                        {result
                          ? "Your observations help shape what comes next."
                          : "Ready when you are. Choose a few activities to explore together."}
                      </p>
                    </div>
                    <button
                      disabled={busy}
                      onClick={generate}
                      className="button secondary"
                    >
                      <RefreshCw size={16} className={busy ? "spinning" : ""} />
                      {busy
                        ? "Finding little possibilities…"
                        : result
                          ? "Request new recommendations"
                          : "Find activities"}
                    </button>
                  </div>
                  {error && (
                    <p className="error" role="alert">
                      {error}{" "}
                      {mode === "live" && (
                        <button
                          className="text-button"
                          onClick={() => setMode("mock")}
                        >
                          Switch to mock mode
                        </button>
                      )}
                    </p>
                  )}
                  {result && (
                    <div
                      className={`result-notice ${result.mode}`}
                      role="status"
                    >
                      <Sparkles size={15} />
                      <span>{result.message}</span>
                    </div>
                  )}
                  {result?.recommendations.length ? (
                    <div className="activity-grid">
                      {result.recommendations.map((r, i) => {
                        const a = activityById(r.activityId);
                        return a ? (
                          <ActivityCard
                            key={a.id}
                            activity={a}
                            index={i}
                            rationale={r.rationale}
                            onClick={() => openActivity(a)}
                            onSkip={() => skip(a)}
                          />
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <div className="recommend-empty">
                      <span className="circle-icon">
                        <BookOpen />
                      </span>
                      <h3>
                        {result
                          ? "A thoughtful pause."
                          : "Your next little moment starts here."}
                      </h3>
                      <p>
                        {result?.message ??
                          "Ask for three activities tailored to this fictional profile. No requests run automatically."}
                      </p>
                      {!result && (
                        <button
                          className="button"
                          onClick={generate}
                          disabled={busy}
                        >
                          {busy
                            ? "Finding activities…"
                            : "Find activities for " + profile.nickname}
                        </button>
                      )}
                    </div>
                  )}
                </section>
                <div className="dashboard-bottom">
                  <section className="journey-card">
                    <div className="section-heading">
                      <h3>Your little moments</h3>
                      <a href="#history" onClick={() => navigate("history")}>
                        View journey <ChevronRight size={14} />
                      </a>
                    </div>
                    <div className="stats-row">
                      <div>
                        <strong>{completed.length}</strong>
                        <span>activities completed</span>
                      </div>
                      <div>
                        <strong>
                          {
                            new Set(
                              history
                                .filter(
                                  (h) =>
                                    h.status === "attempted" ||
                                    h.status === "completed",
                                )
                                .map(
                                  (h) => activityById(h.activityId)?.category,
                                ),
                            ).size
                          }
                        </strong>
                        <span>areas explored</span>
                      </div>
                      <div>
                        <strong>
                          {history.filter((h) => h.feedback.length).length}
                        </strong>
                        <span>observations shared</span>
                      </div>
                    </div>
                    <p className="subtle">
                      Little moments, not milestones to measure up to.
                    </p>
                  </section>
                  <section className="focus-card">
                    <span className="circle-icon">
                      <Leaf size={20} />
                    </span>
                    <div>
                      <h3>Following their curiosity</h3>
                      <p>
                        {profile.focus
                          .map((c) => labels[c].split(" & ")[0])
                          .join(" · ")}
                      </p>
                      <button
                        className="text-button"
                        onClick={() => {
                          setEditing(true);
                          navigate("onboarding");
                        }}
                      >
                        Update focus areas <ChevronRight size={14} />
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            ))}
          {view === "library" && (
            <div className="page-content">
              <PageHeading
                eyebrow="A LITTLE SHELF OF POSSIBILITIES"
                title="The activity library."
                text="Unreviewed demonstration activities, with simple steps and clear boundaries."
              />
              <div className="notice">
                All 40 activities are unreviewed and for fictional use: 4
                adaptations of verified UNICEF ideas and 36 synthetic fixtures.
                Age ranges and difficulty are implementation assumptions.
              </div>
              <div
                className="filter-row"
                aria-label="Filter by developmental area"
              >
                {["all", ...categories].map((c) => (
                  <button
                    key={c}
                    className={filter === c ? "choice selected" : "choice"}
                    aria-pressed={filter === c}
                    onClick={() => setFilter(c)}
                  >
                    {c === "all" ? "All activities" : labels[c as Category]}
                  </button>
                ))}
              </div>
              {profile && (
                <p className="muted">
                  Showing activities eligible for {profile.nickname}’s current
                  settings. Edit the profile to explore other options.
                </p>
              )}
              <div className="activity-grid">
                {(profile ? eligible(profile, history) : library)
                  .filter((a) => filter === "all" || a.category === filter)
                  .map((a, i) => (
                    <ActivityCard
                      key={a.id}
                      activity={a}
                      index={i}
                      onClick={() => openActivity(a)}
                    />
                  ))}
              </div>
              {!(profile ? eligible(profile, history) : library).filter(
                (a) => filter === "all" || a.category === filter,
              ).length && (
                <Empty
                  title="Nothing eligible here just yet."
                  text="Try another category or review the fictional profile. We won’t guess missing abilities."
                  action="Review profile"
                  onClick={() => navigate("settings")}
                />
              )}
            </div>
          )}
          {view === "history" && (
            <div className="page-content">
              <PageHeading
                eyebrow="EVERY LITTLE MOMENT COUNTS"
                title={
                  profile ? `${profile.nickname}’s journey.` : "Your journey."
                }
                text="A record of play and observations. No scores, comparisons, or clinical assessments."
              />
              <div className="summary-band">
                <span>
                  <strong>{completed.length}</strong> completed
                </span>
                <span>
                  <strong>
                    {history.filter((h) => h.status === "attempted").length}
                  </strong>{" "}
                  attempted
                </span>
                <span>
                  <strong>
                    {history.filter((h) => h.feedback.length).length}
                  </strong>{" "}
                  observations
                </span>
              </div>
              {history.length ? (
                <div className="history-list">
                  {[...history].reverse().map((h) => {
                    const a = activityById(h.activityId),
                      Icon = a ? icons[a.category] : BookOpen;
                    return (
                      <article className="history-row" key={h.id}>
                        <span className={`category-icon ${a?.category}`}>
                          <Icon size={23} />
                        </span>
                        <div>
                          <div className="history-title">
                            <h3>{a?.title ?? "Unknown activity"}</h3>
                            <span className={`status-pill ${h.status}`}>
                              {h.status}
                            </span>
                          </div>
                          <p>{h.rationale}</p>
                          <div className="feedback-tags">
                            {h.feedback.map((f) => (
                              <span key={f}>{f.replace("-", " ")}</span>
                            ))}
                          </div>
                          <small>
                            {new Date(h.date).toLocaleString()} ·{" "}
                            {h.mode === "live"
                              ? "Live Gemini"
                              : h.mode === "fallback"
                                ? "Non-AI fallback"
                                : "Simulated"}
                          </small>
                        </div>
                        {a && (
                          <button
                            className="icon-button"
                            aria-label={`View ${a.title}`}
                            onClick={() => openActivity(a)}
                          >
                            <ChevronRight />
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <Empty
                  title="A fresh page for little moments."
                  text="Activities and feedback will appear here after you request recommendations."
                  action="Find your next step"
                  onClick={() => (profile ? navigate("dashboard") : demo())}
                />
              )}
            </div>
          )}
          {view === "settings" && (
            <div className="page-content narrow">
              <PageHeading
                eyebrow="YOUR SPACE, YOUR PACE"
                title="A little room for change."
                text="Manage fictional profiles, demo behavior, and information stored in this browser."
              />
              <section className="settings-card">
                <h2>Fictional profiles</h2>
                {store.profiles.map((p) => (
                  <div className="settings-profile" key={p.id}>
                    <span className="avatar">{p.nickname[0]}</span>
                    <div>
                      <strong>{p.nickname}</strong>
                      <small>{formatAge(p.age)} · fictional profile</small>
                    </div>
                    <button
                      className="button small secondary"
                      disabled={p.id === store.active}
                      onClick={() => setStore((s) => ({ ...s, active: p.id }))}
                    >
                      {p.id === store.active ? "Active" : "Switch profile"}
                    </button>
                  </div>
                ))}
                <div className="button-row">
                  {profile && (
                    <button
                      className="button secondary"
                      onClick={() => {
                        setEditing(true);
                        navigate("onboarding");
                      }}
                    >
                      Edit active profile
                    </button>
                  )}
                  <button className="button" onClick={start}>
                    Add fictional profile
                  </button>
                </div>
                <h3>Or try a sample</h3>
                <div className="choices">
                  {samples.map((p) => (
                    <button
                      className="choice"
                      key={p.id}
                      onClick={() => demo(p)}
                    >
                      {p.nickname} · {formatAge(p.age)}
                    </button>
                  ))}
                </div>
              </section>
              <section className="settings-card">
                <h2>Recommendation mode</h2>
                <p>
                  Mock mode supports the full journey without an API key. Live
                  mode requires server configuration and reviewed live tests.
                </p>
                <label>
                  Mode
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as "mock" | "live")}
                  >
                    <option value="mock">Simulated · deterministic demo</option>
                    <option value="live">
                      Live Gemini · classroom access required
                    </option>
                  </select>
                </label>
                {mode === "live" && (
                  <label>
                    Classroom access code
                    <input
                      type="password"
                      autoComplete="off"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Configured by the project owner"
                    />
                    <small>
                      Held only in memory. Never saved in browser storage.
                    </small>
                  </label>
                )}
              </section>
              <section className="settings-card">
                <h2>Your browser, your data</h2>
                <p>
                  Profiles, history, and demonstration events stay in this
                  browser. Live requests send only fictional structured age,
                  abilities, preferences, materials, and feedback to Google;
                  nicknames are excluded.
                </p>
                <p>
                  No sign-in, cross-device sharing, or caregiver authorization
                  is implemented. This demo is not intended for real child
                  information.
                </p>
                <div className="button-row">
                  <button
                    className="button secondary"
                    disabled={!profile}
                    onClick={() => setConfirm("history")}
                  >
                    Reset active journey
                  </button>
                  <button
                    className="button danger"
                    onClick={() => setConfirm("all")}
                  >
                    Delete all local data
                  </button>
                </div>
              </section>
            </div>
          )}
          {view === "insights" && <EvaluationInsights store={store} />}
          {view === "privacy" && (
            <div className="page-content narrow">
              <PageHeading
                eyebrow="A THOUGHTFUL FOUNDATION"
                title="Safety, privacy & a little clarity."
                text="NextStep is a classroom prototype, not a clinically validated service."
              />
              {[
                {
                  title: "Fictional families only",
                  text: "Use only invented nicknames and structured observations. Do not enter real child names, dates of birth, medical records, photos, contact details, or sensitive family information.",
                },
                {
                  title: "Play is not an assessment",
                  text: "NextStep does not diagnose, screen, treat, infer developmental age, or replace a qualified professional. Unreviewed synthetic activities must not guide real-world child-development decisions.",
                },
                {
                  title: "Your observations, handled gently",
                  text: "Eligibility is checked before selection. Reported difficulty limits subsequent complexity; mastery needs several observations across days before a small progression. Missing prerequisites are never inferred.",
                },
                {
                  title: "Clear limits to automated safeguards",
                  text: "Validation constrains IDs and explanations but cannot guarantee all content is safe or appropriate. Real deployment needs professional content review, privacy and security assessment, and a consented field study.",
                },
                {
                  title: "Local storage and live AI",
                  text: "Demo data and events persist in browser-local storage until deleted in Settings. No third-party analytics are used. If enabled, Google receives minimized fictional structured context. Free-tier provider data terms apply. Mock mode makes no external AI requests.",
                },
                {
                  title: "If there is a concern",
                  text: "Pause activities and discuss developmental concerns with an appropriate qualified professional. For possible immediate danger, seek urgent professional or emergency assistance.",
                },
              ].map((x) => (
                <section className="settings-card" key={x.title}>
                  <h2>{x.title}</h2>
                  <p>{x.text}</p>
                </section>
              ))}
              <button
                className="button"
                onClick={() => navigate(profile ? "dashboard" : "home")}
              >
                Back to {profile ? "your day" : "NextStep"}
              </button>
            </div>
          )}
        </main>
        <footer className="footer">
          <span>
            <Sprout size={15} />
            Small steps. Meaningful progress.
          </span>
          <a href="#privacy" onClick={() => navigate("privacy")}>
            Fictional use only · Unreviewed educational prototype
          </a>
        </footer>
      </div>
      <dialog
        ref={dialog}
        className="activity-dialog"
        onCancel={() => setSelected(null)}
        onClose={() => setSelected(null)}
        aria-labelledby="activity-title"
      >
        {selected && (
          <>
            <button
              className="dialog-close"
              aria-label="Close activity"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>
            <div className={`dialog-art ${selected.category}`}>
              <Illustration kind={selected.category} />
            </div>
            <div className="dialog-body">
              <p className="eyebrow">{labels[selected.category]}</p>
              <h2 id="activity-title">{selected.title}</h2>
              <p>{selected.description}</p>
              <div className="activity-meta">
                <span>
                  <Clock3 size={15} />
                  {selected.minutes} minutes
                </span>
                <span>
                  {selected.difficulty === 1
                    ? "Gentle start"
                    : selected.difficulty === 2
                      ? "A little practice"
                      : "Small next step"}
                </span>
              </div>
              <section className="why-box">
                <Sparkles size={17} />
                <div>
                  <strong>Why this little moment?</strong>
                  <p>
                    {result?.recommendations.find(
                      (r) => r.activityId === selected.id,
                    )?.rationale ??
                      "You are exploring this library activity. It has not been selected by AI."}
                  </p>
                </div>
              </section>
              <h3>Gather a few things</h3>
              <p>
                {selected.materials.length
                  ? selected.materials.join(", ")
                  : "Just a comfortable space and your attention."}
              </p>
              <h3>Give it a little try</h3>
              <ol className="instruction-list">
                {selected.steps.map((s, i) => (
                  <li key={s}>
                    <span>{i + 1}</span>
                    <p>{s}</p>
                  </li>
                ))}
              </ol>
              <section className="safety-box">
                <ShieldCheck size={20} />
                <div>
                  <strong>Stay close, follow their lead</strong>
                  <p>{selected.supervision}</p>
                  {selected.safetyExclusions.map((s) => (
                    <p key={s}>{s}</p>
                  ))}
                </div>
              </section>
              <p className="provenance">
                <BookOpen size={15} />
                {selected.source.organization} · {selected.version} · Unreviewed
                <br />
                {selected.source.basis}
                {selected.source.url && (
                  <>
                    <br />
                    <a
                      href={selected.source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View idea source · accessed {selected.source.accessed}{" "}
                      <ExternalLink size={12} />
                    </a>
                  </>
                )}
              </p>
              {!profile ? (
                <button
                  className="button"
                  onClick={() => {
                    setSelected(null);
                    start();
                  }}
                >
                  Create a fictional profile to record play
                </button>
              ) : saved ? (
                <section className="feedback-success" role="status">
                  <Check size={25} />
                  <h3>A little moment, remembered.</h3>
                  <p>
                    Your observations are saved. Ask for fresh ideas to see how
                    they shape the next recommendation.
                  </p>
                  <button
                    className="button"
                    onClick={() => {
                      setSelected(null);
                      navigate("dashboard");
                    }}
                  >
                    Back to your day
                  </button>
                </section>
              ) : (
                <section className="feedback-form">
                  <p className="eyebrow">YOUR OBSERVATIONS MAKE A DIFFERENCE</p>
                  <h3>How did it feel?</h3>
                  <p>
                    There’s no right answer. More than one observation is
                    welcome.
                  </p>
                  <fieldset>
                    <legend>Activity status</legend>
                    <div className="choices">
                      {(["attempted", "completed"] as const).map((s) => (
                        <button
                          key={s}
                          className={
                            status === s ? "choice selected" : "choice"
                          }
                          aria-pressed={status === s}
                          onClick={() => setStatus(s)}
                        >
                          {s === "completed" ? "Completed" : "Gave it a try"}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend>
                      What did you notice? <small>Optional</small>
                    </legend>
                    <div className="choices">
                      {observations.map((o) => (
                        <button
                          key={o}
                          aria-pressed={feedback.includes(o)}
                          className={
                            feedback.includes(o) ? "choice selected" : "choice"
                          }
                          onClick={() => toggleFeedback(o)}
                        >
                          {o === "not-interested"
                            ? "Not interested"
                            : o[0].toUpperCase() + o.slice(1)}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <p className="subtle">
                    Enjoyed and struggled can go together. One success never
                    causes a big leap.
                  </p>
                  <button className="button" onClick={submitFeedback}>
                    Save this little moment
                  </button>
                </section>
              )}
            </div>
          </>
        )}
      </dialog>
      <dialog
        className="confirm-dialog"
        ref={confirmDialog}
        onCancel={() => setConfirm(null)}
        onClose={() => setConfirm(null)}
        aria-labelledby="confirm-title"
      >
        <h2 id="confirm-title">
          {confirm === "all"
            ? "Delete all local demo data?"
            : "Start this journey fresh?"}
        </h2>
        <p>
          {confirm === "all"
            ? "This removes every fictional profile, activity, recommendation, and local event in this browser."
            : "This removes the active profile’s history and recommendations. The profile stays available."}
        </p>
        <div className="button-row">
          <button className="button secondary" onClick={() => setConfirm(null)}>
            Keep exploring
          </button>
          <button
            className="button danger"
            onClick={() => {
              if (confirm === "all") {
                setStore(structuredClone(emptyStore));
                setMode("mock");
                setCode("");
                setStorageError("");
                navigate("home");
              } else if (profile)
                setStore((s) => ({
                  ...s,
                  history: s.history.filter((h) => h.profileId !== profile.id),
                  results: Object.fromEntries(
                    Object.entries(s.results).filter(
                      ([id]) => id !== profile.id,
                    ),
                  ),
                  events: s.events.filter((e) => e.profileId !== profile.id),
                }));
              setConfirm(null);
            }}
          >
            Confirm {confirm === "all" ? "deletion" : "reset"}
          </button>
        </div>
      </dialog>
    </>
  );
}
function PageHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </div>
  );
}
function Empty({
  title,
  text,
  action,
  onClick,
}: {
  title: string;
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <section className="empty-state">
      <span className="circle-icon">
        <Sprout />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
      <button className="button" onClick={onClick}>
        {action}
      </button>
    </section>
  );
}
function ActivityCard({
  activity: a,
  index,
  rationale,
  onClick,
  onSkip,
}: {
  activity: Activity;
  index: number;
  rationale?: string;
  onClick: () => void;
  onSkip?: () => void;
}) {
  const Icon = icons[a.category];
  return (
    <article
      className="activity-card"
      style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
    >
      <button
        className={`activity-picture ${a.category}`}
        aria-label={`View ${a.title}`}
        onClick={onClick}
      >
        <Illustration kind={a.category} />
        <span className="duration">
          <Clock3 size={13} />
          {a.minutes} min
        </span>
      </button>
      <div className="activity-card-body">
        <span className={`category-label ${a.category}`}>
          <Icon size={14} />
          {labels[a.category]}
        </span>
        <h3>
          <button onClick={onClick}>{a.title}</button>
        </h3>
        <p>{a.description}</p>
        {rationale && (
          <div className="card-rationale">
            <Sparkles size={14} />
            <span>{rationale}</span>
          </div>
        )}
        <div className="card-footer">
          <button className="text-button" onClick={onClick}>
            Let’s explore <ChevronRight size={16} />
          </button>
          {onSkip ? (
            <button
              className="skip-button"
              aria-label={`Skip ${a.title}`}
              onClick={onSkip}
            >
              Skip
            </button>
          ) : (
            <span>
              {a.difficulty === 1
                ? "Gentle start"
                : a.difficulty === 2
                  ? "A little practice"
                  : "Small next step"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
