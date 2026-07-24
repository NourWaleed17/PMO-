import { useState, type FormEvent } from "react";
import { useAuth } from "../data/AuthContext";

/** Gate shown when nobody's signed in. Email/password only, per the
 *  confirmed decision -- Google SSO is a later addition (docs/HANDOFF.md
 *  "Phase 2"), not built here. */
export default function Auth() {
  const { signIn, signUp, error } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSignedUp(false);
    if (mode === "sign-in") {
      await signIn(email, password);
    } else {
      await signUp(email, password);
      setSignedUp(true);
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant p-8">
        <h1 className="text-headline-md text-primary mb-1">Capital executive dashboard</h1>
        <p className="text-body-md text-on-surface-variant mb-6">Cluster 1 — sign in to continue</p>

        <div className="flex mb-6 border border-outline-variant">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={`flex-1 py-2 text-body-md ${mode === "sign-in" ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className={`flex-1 py-2 text-body-md ${mode === "sign-up" ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-label-sm text-on-surface-variant">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-outline-variant px-3 py-2 text-body-md text-on-surface bg-surface-container-lowest focus:outline-2 focus:outline-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-label-sm text-on-surface-variant">
            Password
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-outline-variant px-3 py-2 text-body-md text-on-surface bg-surface-container-lowest focus:outline-2 focus:outline-primary"
            />
          </label>

          {error && (
            <p role="alert" className="text-label-sm text-error">
              {error}
            </p>
          )}
          {signedUp && !error && (
            <p role="status" className="text-label-sm text-on-surface-variant">
              Account created. If email confirmation is required on this project, check your inbox before signing
              in.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-on-primary py-2 text-body-md font-bold disabled:opacity-50"
          >
            {submitting ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-label-sm text-on-surface-variant">
          New accounts start as viewers. Ask an admin to promote you to editor if you need to change rates.
        </p>
      </div>
    </div>
  );
}
