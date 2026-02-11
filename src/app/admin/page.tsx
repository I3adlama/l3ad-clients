import { requireAdmin } from "@/lib/dal";
import Dashboard from "./Dashboard";

export default async function AdminPage() {
  await requireAdmin();
  return <Dashboard />;
}
