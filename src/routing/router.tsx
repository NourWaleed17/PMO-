import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface RouteState {
  pathname: string;
  search: URLSearchParams;
}

interface RouteContextValue extends RouteState {
  navigate: (pathname: string) => void;
  setSearch: (updater: (prev: URLSearchParams) => URLSearchParams) => void;
}

function readLocation(): RouteState {
  return { pathname: window.location.pathname, search: new URLSearchParams(window.location.search) };
}

const RouteContext = createContext<RouteContextValue | null>(null);

/** Deliberately not a router library — a handful of screens plus query-param
 *  filters don't warrant one, and it's not in the brief's tech stack. Must
 *  be a shared context, not a plain hook: `pushState` doesn't fire
 *  `popstate`, so a per-call-site `useState` (the original implementation)
 *  left every component but the one that called `navigate()` unaware the
 *  URL had changed — clicking a nav link updated the address bar and that
 *  link's own component, but the screen underneath never re-rendered. One
 *  shared instance means every consumer sees the same update. */
export function RouteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RouteState>(readLocation);

  useEffect(() => {
    const onPopState = () => setState(readLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((pathname: string) => {
    window.history.pushState({}, "", pathname);
    setState({ pathname, search: new URLSearchParams() });
  }, []);

  const setSearch = useCallback((updater: (prev: URLSearchParams) => URLSearchParams) => {
    setState((prev) => {
      const nextSearch = updater(new URLSearchParams(prev.search));
      const qs = nextSearch.toString();
      const url = qs ? `${prev.pathname}?${qs}` : prev.pathname;
      window.history.pushState({}, "", url);
      return { pathname: prev.pathname, search: nextSearch };
    });
  }, []);

  const value = useMemo(() => ({ ...state, navigate, setSearch }), [state, navigate, setSearch]);

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRoute(): RouteContextValue {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRoute must be used within a RouteProvider");
  return ctx;
}
