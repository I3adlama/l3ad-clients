import { requireAdmin } from "@/lib/dal";
import ProjectDetail from "./ProjectDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  return <ProjectDetail projectId={id} />;
}
