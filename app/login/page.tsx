"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-4">
      <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Welcome back to ReadAct.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-500">
        No account?{" "}
        <Link href="/signup" className="font-medium text-neutral-900 underline">
          Sign up
        </Link>
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        <Link href="/demo" className="underline">
          View the public demo
        </Link>{" "}
        without logging in.
      </p>
    </div>
  );
}
