import { useCallback, useEffect, useState } from "react";

/** Deliberately not a router library — two screens don't warrant one, and
 *  the brief specifies no state/routing dependency beyond the listed stack.
 *  Revisit once the global filters (docs/BRIEF.md section 5) need to read
 *  and write query params alongside the path. */
export function useRoute(): [string, (path: string) => void] {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((next: string) => {
    if (next !== window.location.pathname) {
      window.history.pushState({}, "", next);
      setPath(next);
    }
  }, []);

  return [path, navigate];
}
