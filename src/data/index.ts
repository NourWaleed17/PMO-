import rawModel from "./seed.json";
import { modelSchema } from "./schema";
import type { Model } from "../engine/engine";

/** The only place components import model data from (see docs/BRIEF.md
 *  section 6). Validates the hand-edited seed file on load and fails loudly
 *  with a specific error if its shape drifts from the engine's contract. */
function loadModel(): Model {
  const result = modelSchema.safeParse(rawModel);
  if (!result.success) {
    throw new Error(`seed.json does not match the model schema:\n${result.error.message}`);
  }
  return result.data;
}

export const model: Model = loadModel();
