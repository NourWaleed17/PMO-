import { useCallback, useEffect, useState } from "react";

export interface RouteState {
  pathname: string;
  search: URLSearchParams;
}

function readLocation(): RouteState {
  return { pathname: window.location.pathname, search: new URLSearchParams(window.location.search) };
}

/** Deliberately not a router library — a handful of screens plus query-param
 *  filters don't warrant one, and it's not in the brief's tech stack.
 *  `pathname` picks the screen; `search` carries the global filters
 *  (docs/BRIEF.md section 5), shared across every screen that reads it. */
export function useRoute() {
  const [state, setState] = useState<RouteState>(readLocation);

  useEffect(() => {
    const onPopState = () => setState(readLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const push = useCallback((pathname: string, search: URLSearchParams) => {
    const qs = search.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    window.history.pushState({}, "", url);
    setState({ pathname, search });
  }, []);

  const navigate = useCallback((pathname: string) => push(pathname, new URLSearchParams()), [push]);

  /** Update the query string in place, keeping the current screen. */
  const setSearch = useCallback(
    (updater: (prev: URLSearchParams) => URLSearchParams) => {
      setState((prev) => {
        const nextSearch = updater(new URLSearchParams(prev.search));
        const qs = nextSearch.toString();
        const url = qs ? `${prev.pathname}?${qs}` : prev.pathname;
        window.history.pushState({}, "", url);
        return { pathname: prev.pathname, search: nextSearch };
      });
    },
    [],
  );

  return { pathname: state.pathname, search: state.search, navigate, setSearch };
}
