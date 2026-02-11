import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "./auth";

export const requireAdmin = cache(async () => {
  const session = await verifySession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
});
