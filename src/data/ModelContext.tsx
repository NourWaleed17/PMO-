import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Model } from "../engine/engine";
import { model as seedModel } from "./index";

/** The one place edited state lives (docs/BRIEF.md section 1: "edits held
 *  in React state, with reset and export"). Every screen reads `model` from
 *  here instead of importing the static seed directly, so an edit on the
 *  Rates screen is immediately visible everywhere else — same state, not a
 *  copy. `seedModel` (the frozen original from `src/data/index.ts`) is never
 *  mutated; every edit clones it (or the current state) first. */

interface ModelContextValue {
  model: Model;
  seedModel: Model;
  update: (mutator: (draft: Model) => void) => void;
  reset: () => void;
}

const ModelContext = createContext<ModelContextValue | null>(null);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [model, setModel] = useState<Model>(() => structuredClone(seedModel));

  const update = useCallback((mutator: (draft: Model) => void) => {
    setModel((prev) => {
      const draft = structuredClone(prev);
      mutator(draft);
      return draft;
    });
  }, []);

  const reset = useCallback(() => setModel(structuredClone(seedModel)), []);

  const value = useMemo(() => ({ model, seedModel, update, reset }), [model, update, reset]);

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}

export function useModel(): ModelContextValue {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModel must be used within a ModelProvider");
  return ctx;
}
