"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, IntakeResponses } from "@/lib/types";
import { STEP_LABELS } from "@/lib/types";
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

export default function ProjectDetail({ projectId }: Props) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [deleting, setDeleting] = useState(false);
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
        const data = await res.json();
        setAnalyzeError(data.error || "Analysis failed");
        return;
      }

      // Re-fetch full project — server updates client_name, type, location, social_urls
      await fetchProject();
    } catch {
      setAnalyzeError("Something went wrong");
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

  // Safely coerce array fields — AI sometimes returns strings instead of arrays
  const analysis = rawAnalysis ? {
    ...rawAnalysis,
    services: Array.isArray(rawAnalysis.services) ? rawAnalysis.services : [],
    strengths: Array.isArray(rawAnalysis.strengths) ? rawAnalysis.strengths : [],
    branding_clues: Array.isArray(rawAnalysis.branding_clues) ? rawAnalysis.branding_clues : [],
    review_highlights: Array.isArray(rawAnalysis.review_highlights) ? rawAnalysis.review_highlights : [],
    suggested_questions: Array.isArray(rawAnalysis.suggested_questions) ? rawAnalysis.suggested_questions : [],
  } : null;

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
            {isUrlFirstProject && !analysis
              ? "Discovering business info and analyzing online presence..."
              : "Fetching pages and analyzing with AI..."}
          </div>
        )}

        {analysis && !analyzing && (
          <div className="space-y-4">
            {/* Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">Business</span>
                <p className="text-white text-sm">{analysis.business_name}</p>
              </div>
              <div>
                <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">Type</span>
                <p className="text-white text-sm">{analysis.business_type}</p>
              </div>
              <div>
                <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">Location</span>
                <p className="text-white text-sm">{analysis.location}</p>
              </div>
              <div>
                <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">Tone</span>
                <p className="text-white text-sm">{analysis.tone}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">Description</span>
              <p className="text-[var(--text-muted)] text-sm mt-1">{analysis.description}</p>
            </div>

            {/* Services */}
            {analysis.services.length > 0 && (
              <div>
                <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">Services Found</span>
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

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div>
                <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">Strengths</span>
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

            {/* Branding Clues */}
            {analysis.branding_clues.length > 0 && (
              <div>
                <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">Branding Clues</span>
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
                <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">Review Highlights</span>
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
                <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">
                  Suggested Questions for Intake
                </span>
                <div className="space-y-2 mt-2">
                  {analysis.suggested_questions.map((q, i) => (
                    <div
                      key={i}
                      className="bg-noir-700 rounded p-3 border border-[var(--border)]"
                    >
                      <p className="text-white text-sm font-bold">{q.question}</p>
                      <p className="text-[var(--text-soft)] text-xs mt-1">
                        <span className="text-accent">{q.section}</span> — {q.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pipeline Meta */}
            {analysis._meta && (
              <div className="border-t border-[var(--border)] pt-3 space-y-2">
                {/* Approval Status */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                  analysis._meta.approved
                    ? "bg-green-400/10 border border-green-400/30"
                    : "bg-yellow-400/10 border border-yellow-400/30"
                }`}>
                  <span className={analysis._meta.approved ? "text-green-400" : "text-yellow-400"}>
                    {analysis._meta.approved ? "Approved" : "Needs Review"}
                  </span>
                  <span className="text-[var(--text-soft)]">by Opus</span>
                </div>

                {/* Approval Notes */}
                {analysis._meta.approval_notes && (
                  <div className="bg-noir-700 rounded p-3 border border-[var(--border)]">
                    <span className="text-[var(--text-soft)] text-xs uppercase tracking-wider">Strategist Notes</span>
                    <p className="text-[var(--text-muted)] text-sm mt-1">{analysis._meta.approval_notes}</p>
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
                    Pages: {analysis._meta.pages_with_content}/{analysis._meta.pages_fetched} with content
                  </span>
                  {analysis._meta.follow_up_performed && (
                    <span className="text-xs text-yellow-400">Follow-up performed</span>
                  )}
                </div>
                <p className="text-[var(--text-soft)] text-xs">
                  Pipeline: {analysis._meta.models_used.map(m => m.split("-").slice(1, 3).join("-")).join(" → ")}
                </p>
                <p className="text-[var(--text-soft)] text-xs">
                  Intake form pre-filled with discovered info. Client can review and update.
                </p>
              </div>
            )}
          </div>
        )}

        {!analysis && !analyzing && (
          <p className="text-[var(--text-soft)] text-sm">
            {isUrlFirstProject
              ? "Analysis will start automatically..."
              : "Click \u201cAnalyze Links\u201d to have AI scan the client\u2019s online presence and pre-fill their intake form."}
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
            In progress — on step {project.current_step + 1} ({STEP_LABELS[project.current_step]})
          </p>
        ) : (
          <p className="text-[var(--text-soft)] text-sm">
            Not started yet. Send the intake link to your client.
          </p>
        )}
      </NoirPanel>

      {/* Response Brief */}
      {project.intake_completed && project.responses && (
        <ResponseBrief responses={project.responses} />
      )}
    </div>
  );
}
