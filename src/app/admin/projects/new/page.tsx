import { requireAdmin } from "@/lib/dal";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-3xl font-display mb-8">New Project</h1>
      <div className="noir-panel p-6 max-w-2xl">
        <ProjectForm />
      </div>
    </div>
  );
}
