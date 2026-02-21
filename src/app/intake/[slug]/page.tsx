import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import IntakeWizard from "@/components/intake/IntakeWizard";
import type { AiPrefill } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const sql = getDb();
  const projects = await sql`SELECT client_name FROM projects WHERE slug = ${slug}`;

  if (projects.length === 0) return { title: "Not Found" };

  return {
    title: `${projects[0].client_name} — Intake`,
    description: `Project questionnaire for ${projects[0].client_name}`,
  };
}

export default async function IntakePage({ params }: PageProps) {
  const { slug } = await params;
  const sql = getDb();

  const projects = await sql`
    SELECT p.*, ir.responses, ir.current_step, ir.completed, p.ai_analysis
    FROM projects p
    LEFT JOIN intake_responses ir ON ir.project_id = p.id
    WHERE p.slug = ${slug}
  `;

  if (projects.length === 0) {
    notFound();
  }

  const project = projects[0];

  if (project.completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="noir-panel p-8 text-center max-w-md">
          <h1 className="font-display text-3xl mb-3">All Done!</h1>
          <p className="text-[var(--text-muted)]">
            You&apos;ve already completed this questionnaire. We&apos;re working on your project!
          </p>
        </div>
      </div>
    );
  }

  // Extract AI-discovered services if analysis exists (AI may return string instead of array)
  const rawServices = project.ai_analysis?.services;
  const aiServices: string[] = Array.isArray(rawServices) ? rawServices : [];

  // Extract AI prefill data for form fields
  const aiPrefill: AiPrefill | undefined = project.ai_analysis?.prefill || undefined;

  // Extract location for the radius slider
  const location: string | undefined = project.location || undefined;

  return (
    <IntakeWizard
      slug={slug}
      clientName={project.client_name}
      initialResponses={project.responses || {}}
      initialStep={project.current_step || 0}
      aiServices={aiServices.length > 0 ? aiServices : undefined}
      aiPrefill={aiPrefill}
      location={location}
    />
  );
}
