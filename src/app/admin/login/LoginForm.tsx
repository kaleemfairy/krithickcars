"use client";

import { useActionState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { login, type LoginState } from "@/app/actions/admin";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null);
  return (
    <form action={action} className="card grid gap-4 p-6 shadow-2xl">
      <input type="hidden" name="next" value={next} />
      <label>
        <span className="field-label">Staff email</span>
        <input name="email" type="email" autoComplete="username" required className="field" />
      </label>
      <label>
        <span className="field-label">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      {state?.error && <p role="alert" className="rounded bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">{state.error}</p>}
      <button disabled={pending} className="btn-dark py-3">
        {pending ? <Loader2 size={18} className="animate-spin" /> : <LockKeyhole size={18} />} Sign in
      </button>
    </form>
  );
}
