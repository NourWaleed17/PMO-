import { useEffect, useState, type ReactNode } from "react";
import type { Model } from "../engine/engine";
import { useAuth } from "./AuthContext";
import { fetchLiveModel } from "./live";
import Auth from "../screens/Auth";

/** Sits between AuthProvider and the rest of the app. Nothing past this
 *  point renders until there's both a signed-in session and a successfully
 *  fetched, validated live model -- RLS grants no reads to unauthenticated
 *  requests, so there's nothing to show before then anyway. */
export function LiveModelGate({ children }: { children: (model: Model) => ReactNode }) {
  const { session, profile, loading: authLoading } = useAuth();
  const [model, setModel] = useState<Model | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setModel(null);
      return;
    }
    let cancelled = false;
    setModel(null);
    setError(null);
    fetchLiveModel()
      .then((m) => {
        if (!cancelled) setModel(m);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (authLoading) {
    return <FullScreenMessage>Loading…</FullScreenMessage>;
  }
  if (!session) {
    return <Auth />;
  }
  if (error) {
    return <FullScreenMessage tone="error">{error}</FullScreenMessage>;
  }
  if (!profile || !model) {
    return <FullScreenMessage>Loading Cluster 1 data…</FullScreenMessage>;
  }
  return <>{children(model)}</>;
}

function FullScreenMessage({ children, tone = "normal" }: { children: ReactNode; tone?: "normal" | "error" }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <p className={`text-body-md ${tone === "error" ? "text-error" : "text-on-surface-variant"} max-w-md text-center`}>
        {children}
      </p>
    </div>
  );
}
