"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-neutral-500">
          We sent a confirmation link to {email}. Confirm it, then log in.
        </p>
        <Link
          href="/login"
          className="mt-4 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-4">
      <h1 className="text-2xl font-bold tracking-tight">Sign up</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Create your ReadAct account.
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
            minLength={6}
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
          {pending ? "Signing up…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-neutral-900 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
