"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, IntakeResponses } from "@/lib/types";
import { STEP_LABELS, modelLabel } from "@/lib/types";
import type { BusinessAnalysis } from "@/lib/agent";
import NoirPanel from "@/components/ui/NoirPanel";
import BevelButton from "@/components/ui/BevelButton";
import ResponseBrief from "@/components/admin/ResponseBrief";

interface ProjectData extends Project {
  responses: IntakeResponses;
  current_step: number;
  intake_completed: boolean;
  intake_started_at: string | null;
  intake_completed_at: string | null;
  ai_analysis: BusinessAnalysis | null;
}

interface Props {
  projectId: string;
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">{children}</span>;
}

const STATUS_COLORS: Record<string, string> = {
  ok: "text-green-400",
  "meta-only": "text-accent",
  empty: "text-yellow-400",
  failed: "text-red-400",
  skipped: "text-[var(--text-soft)]",
};

export default function ProjectDetail({ projectId }: Props) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const autoTriggered = useRef(false);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject().finally(() => setLoading(false));
  }, [fetchProject]);

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    setAnalyzeError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
      });

      if (!res.ok) {
        let message = "Analysis failed";
        try {
          const data = await res.json();
          message = data.error || message;
        } catch {
          message = `Analysis failed (${res.status})`;
        }
        setAnalyzeError(message);
        return;
      }

      // Re-fetch full project: the server updates client_name, type, location, social_urls
      await fetchProject();
    } catch {
      setAnalyzeError("Something went wrong. Check your connection and try again.");
    } finally {
      setAnalyzing(false);
    }
  }, [projectId, fetchProject]);

  // Auto-trigger analysis when project has source_url but no ai_analysis
  useEffect(() => {
    if (
      project &&
      project.source_url &&
      !project.ai_analysis &&
      !analyzing &&
      !autoTriggered.current
    ) {
      autoTriggered.current = true;
      handleAnalyze();
    }
  }, [project, analyzing, handleAnalyze]);

  if (loading) {
    return (
      <div className="text-[var(--text-soft)] text-center py-12">Loading...</div>
    );
  }

  if (!project) {
    return (
      <div className="text-red-400 text-center py-12">Project not found</div>
    );
  }

  const intakeUrl = `${window.location.origin}/intake/${project.slug}`;
  const rawAnalysis = project.ai_analysis;
  const isUrlFirstProject = !!project.source_url;

  // Safely coerce array fields; older analyses may hold strings where arrays are expected
  const analysis = rawAnalysis ? {
    ...rawAnalysis,
    services: Array.isArray(rawAnalysis.services) ? rawAnalysis.services : [],
    strengths: Array.isArray(rawAnalysis.strengths) ? rawAnalysis.strengths : [],
    branding_clues: Array.isArray(rawAnalysis.branding_clues) ? rawAnalysis.branding_clues : [],
    review_highlights: Array.isArray(rawAnalysis.review_highlights) ? rawAnalysis.review_highlights : [],
    suggested_questions: Array.isArray(rawAnalysis.suggested_questions) ? rawAnalysis.suggested_questions : [],
    team: Array.isArray(rawAnalysis.team) ? rawAnalysis.team : [],
    locations: Array.isArray(rawAnalysis.locations) ? rawAnalysis.locations : [],
  } : null;

  const market = analysis?.market;
  const hasMarket =
    !!market &&
    (!!market.google_rating || !!market.review_count ||
      (market.review_themes?.length ?? 0) > 0 ||
      (market.competitors?.length ?? 0) > 0 ||
      (market.notable?.length ?? 0) > 0);

  function copyLink() {
    navigator.clipboard.writeText(intakeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin");
      }
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display">{project.client_name}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-soft)]">
            {project.business_type && <span>{project.business_type}</span>}
            {project.business_type && project.location && (
              <span>&middot;</span>
            )}
            {project.location && <span>{project.location}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <BevelButton href="/admin" variant="secondary" size="sm">
            Back
          </BevelButton>
        </div>
      </div>

      {/* Intake Link */}
      <NoirPanel accent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-sm text-[var(--text-soft)]">Intake Link</span>
            <p className="text-accent text-sm truncate">{intakeUrl}</p>
          </div>
          <button
            onClick={copyLink}
            className="text-sm font-ui tracking-wider uppercase text-accent hover:text-accent-bright shrink-0"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </NoirPanel>

      {/* AI Analysis */}
      <NoirPanel className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">AI Analysis</h3>
          {(project.social_urls?.length > 0 || isUrlFirstProject) && (
            <BevelButton
              size="sm"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing
                ? "Analyzing..."
                : analysis
                  ? "Re-Analyze"
                  : "Analyze Links"}
            </BevelButton>
          )}
        </div>

        {analyzeError && (
          <p className="text-red-400 text-sm mb-3">{analyzeError}</p>
        )}

        {analyzing && (
          <div className="text-[var(--text-soft)] text-sm py-4 text-center">
            <div className="inline-block w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2 align-middle" />
            Crawling the site, researching reviews and competitors, then writing the analysis. This takes two to four minutes.
          </div>
        )}

        {analysis && !analyzing && (
          <div className="space-y-4">
            {/* Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Business</Label>
                <p className="text-white text-sm">{analysis.business_name}</p>
              </div>
              <div>
                <Label>Type</Label>
                <p className="text-white text-sm">{analysis.business_type}</p>
              </div>
              <div>
                <Label>Location</Label>
                <p className="text-white text-sm">{analysis.location}</p>
              </div>
              <div>
                <Label>Tone</Label>
                <p className="text-white text-sm">{analysis.tone}</p>
              </div>
              {analysis.founded && (
                <div>
                  <Label>Founded</Label>
                  <p className="text-white text-sm">{analysis.founded}</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <p className="text-[var(--text-muted)] text-sm mt-1">{analysis.description}</p>
            </div>

            {/* Services */}
            {analysis.services.length > 0 && (
              <div>
                <Label>Services Found</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {analysis.services.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs bg-accent/10 text-accent px-2 py-1 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Team + Locations */}
            {(analysis.team.length > 0 || analysis.locations.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.team.length > 0 && (
                  <div>
                    <Label>Team</Label>
                    <ul className="text-sm text-[var(--text-muted)] mt-1 space-y-1">
                      {analysis.team.map((m, i) => (
                        <li key={i}>
                          <span className="text-white">{m.name}</span>
                          {m.role && <span className="text-[var(--text-soft)]"> · {m.role}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.locations.length > 0 && (
                  <div>
                    <Label>Locations</Label>
                    <ul className="text-sm text-[var(--text-muted)] mt-1 space-y-1">
                      {analysis.locations.map((l, i) => (
                        <li key={i}>
                          <span className="text-white">{l.name}</span>
                          {l.address && <span className="block text-xs">{l.address}</span>}
                          {l.phone && <span className="block text-xs">{l.phone}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div>
                <Label>Strengths</Label>
                <ul className="text-sm text-[var(--text-muted)] mt-1 space-y-1">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Market research */}
            {hasMarket && market && (
              <div className="bg-noir-700 rounded p-3 border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Reputation &amp; Market</Label>
                  {(market.google_rating || market.review_count) && (
                    <span className="text-sm text-white">
                      {market.google_rating && <span className="text-accent font-bold">{market.google_rating}★</span>}
                      {market.review_count && <span className="text-[var(--text-soft)]"> · {market.review_count} reviews</span>}
                    </span>
                  )}
                </div>

                {market.review_themes.length > 0 && (
                  <div>
                    <span className="text-[var(--text-soft)] text-xs">What customers say</span>
                    <ul className="text-sm text-[var(--text-muted)] mt-1 space-y-1">
                      {market.review_themes.map((t, i) => (
                        <li key={i}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {market.competitors.length > 0 && (
                  <div>
                    <span className="text-[var(--text-soft)] text-xs">Local competitors</span>
                    <div className="mt-1 space-y-1.5">
                      {market.competitors.map((c, i) => (
                        <div key={i} className="text-sm">
                          <span className="text-white">{c.name}</span>
                          {c.rating && <span className="text-[var(--text-soft)]"> · {c.rating}</span>}
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:text-accent-bright text-xs ml-2"
                            >
                              site
                            </a>
                          )}
                          {c.notes && <p className="text-[var(--text-muted)] text-xs">{c.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {market.notable.length > 0 && (
                  <div>
                    <span className="text-[var(--text-soft)] text-xs">Worth knowing</span>
                    <ul className="text-sm text-[var(--text-muted)] mt-1 space-y-1">
                      {market.notable.map((n, i) => (
                        <li key={i}>• {n}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Branding Clues */}
            {analysis.branding_clues.length > 0 && (
              <div>
                <Label>Branding Clues</Label>
                <ul className="text-sm text-[var(--text-muted)] mt-1 space-y-1">
                  {analysis.branding_clues.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Review Highlights */}
            {analysis.review_highlights.length > 0 && (
              <div>
                <Label>Review Highlights</Label>
                <ul className="text-sm text-[var(--text-muted)] mt-1 space-y-1">
                  {analysis.review_highlights.map((r, i) => (
                    <li key={i} className="italic">&ldquo;{r}&rdquo;</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Questions */}
            {analysis.suggested_questions.length > 0 && (
              <div>
                <Label>Questions to ask the client</Label>
                <div className="space-y-2 mt-2">
                  {analysis.suggested_questions.map((q, i) => (
                    <div
                      key={i}
                      className="bg-noir-700 rounded p-3 border border-[var(--border)]"
                    >
                      <p className="text-white text-sm font-bold">{q.question}</p>
                      <p className="text-[var(--text-soft)] text-xs mt-1">
                        <span className="text-accent">{q.section}</span> · {q.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pipeline Meta */}
            {analysis._meta && (
              <div className="border-t border-[var(--border)] pt-3 space-y-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                  analysis._meta.approved
                    ? "bg-green-400/10 border border-green-400/30"
                    : "bg-yellow-400/10 border border-yellow-400/30"
                }`}>
                  <span className={analysis._meta.approved ? "text-green-400" : "text-yellow-400"}>
                    {analysis._meta.approved ? "Approved" : "Needs Review"}
                  </span>
                  <span className="text-[var(--text-soft)]">by the reviewer</span>
                </div>

                {analysis._meta.approval_notes && (
                  <div className="bg-noir-700 rounded p-3 border border-[var(--border)]">
                    <Label>Strategist Notes</Label>
                    <p className="text-[var(--text-muted)] text-sm mt-1 whitespace-pre-wrap">{analysis._meta.approval_notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[var(--text-soft)] text-xs">
                    Quality: <span className={
                      analysis._meta.quality_score === "excellent" ? "text-green-400" :
                      analysis._meta.quality_score === "good" ? "text-accent" :
                      analysis._meta.quality_score === "fair" ? "text-yellow-400" :
                      "text-red-400"
                    }>{analysis._meta.quality_score}</span>
                  </span>
                  <span className="text-[var(--text-soft)] text-xs">
                    Pages: {analysis._meta.pages_with_content}/{analysis._meta.pages_fetched} readable
                  </span>
                  {analysis._meta.research_performed && (
                    <span className="text-xs text-accent">
                      Web research: {analysis._meta.research_searches} searches
                    </span>
                  )}
                  {analysis._meta.follow_up_performed && (
                    <span className="text-xs text-yellow-400">Follow-up performed</span>
                  )}
                  {analysis._meta.duration_seconds > 0 && (
                    <span className="text-[var(--text-soft)] text-xs">
                      {Math.round(analysis._meta.duration_seconds / 60 * 10) / 10} min
                    </span>
                  )}
                </div>
                <p className="text-[var(--text-soft)] text-xs">
                  Pipeline: {analysis._meta.models_used.map(modelLabel).join(" → ")}
                  {analysis._meta.analyzed_at && (
                    <> · {new Date(analysis._meta.analyzed_at).toLocaleString()}</>
                  )}
                </p>

                {analysis._meta.research_notes && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowResearch((s) => !s)}
                      className="text-xs text-accent hover:text-accent-bright"
                    >
                      {showResearch ? "Hide" : "Show"} raw research notes
                    </button>
                    {showResearch && (
                      <pre className="mt-2 text-xs text-[var(--text-muted)] whitespace-pre-wrap font-sans bg-noir-700 rounded p-3 border border-[var(--border)]">
                        {analysis._meta.research_notes}
                      </pre>
                    )}
                  </div>
                )}

                {analysis._meta.sources?.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowSources((s) => !s)}
                      className="text-xs text-accent hover:text-accent-bright"
                    >
                      {showSources ? "Hide" : "Show"} sources read ({analysis._meta.sources.length})
                    </button>
                    {showSources && (
                      <ul className="mt-2 space-y-1">
                        {analysis._meta.sources.map((s, i) => (
                          <li key={i} className="text-xs flex gap-2 items-baseline">
                            <span className={`w-16 shrink-0 ${STATUS_COLORS[s.status] || ""}`}>{s.status}</span>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--text-muted)] hover:text-accent truncate"
                              title={s.url}
                            >
                              {s.label}
                            </a>
                            {s.note && <span className="text-[var(--text-soft)] shrink-0">{s.note}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <p className="text-[var(--text-soft)] text-xs">
                  Intake form pre-filled with discovered info. The client can review and update.
                </p>
              </div>
            )}
          </div>
        )}

        {!analysis && !analyzing && (
          <p className="text-[var(--text-soft)] text-sm">
            {isUrlFirstProject
              ? "Analysis will start automatically..."
              : "Click “Analyze Links” to have AI scan the client’s online presence and pre-fill their intake form."}
          </p>
        )}
      </NoirPanel>

      {/* Social URLs */}
      {project.social_urls && project.social_urls.length > 0 && (
        <NoirPanel className="p-4">
          <h3 className="font-display text-lg mb-3">Links</h3>
          <div className="space-y-2">
            {project.social_urls.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[var(--text-soft)] text-sm w-28 shrink-0">
                  {link.platform}
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent text-sm truncate hover:text-accent-bright"
                >
                  {link.url}
                </a>
              </div>
            ))}
          </div>
        </NoirPanel>
      )}

      {/* Notes */}
      {project.notes && (
        <NoirPanel className="p-4">
          <h3 className="font-display text-lg mb-2">Notes</h3>
          <p className="text-[var(--text-muted)] text-sm whitespace-pre-wrap">
            {project.notes}
          </p>
        </NoirPanel>
      )}

      {/* Status */}
      <NoirPanel className="p-4">
        <h3 className="font-display text-lg mb-3">Intake Status</h3>
        {project.intake_completed ? (
          <p className="text-green-400 text-sm">
            Completed{" "}
            {project.intake_completed_at &&
              `on ${new Date(project.intake_completed_at).toLocaleDateString()}`}
          </p>
        ) : project.current_step > 0 ? (
          <p className="text-yellow-400 text-sm">
            In progress, last saved on step {project.current_step + 1} ({STEP_LABELS[project.current_step]})
          </p>
        ) : (
          <p className="text-[var(--text-soft)] text-sm">
            Not started yet. Send the intake link to your client.
          </p>
        )}
      </NoirPanel>

      {/* Response Brief */}
      {project.responses && (project.intake_completed || project.current_step > 0) && (
        <ResponseBrief responses={project.responses} />
      )}
    </div>
  );
}
