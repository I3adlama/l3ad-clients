"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BevelButton from "@/components/ui/BevelButton";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display mb-2">L3ad Solutions</h1>
          <p className="text-[var(--text-soft)] text-sm">Client Intake Admin</p>
        </div>

        <div className="noir-panel p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <BevelButton type="submit" full disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </BevelButton>
          </form>
        </div>
      </div>
    </div>
  );
}
