import model from "./data/seed.json";
import { summarise, type Model } from "./engine/engine";

// Placeholder pending the design decision in docs/BRIEF.md section 4.
// Confirms the data → engine → component wiring works. Replace with the
// chosen Overview direction; do not build further screens on top of this.
// TODO(next): validate `model` with zod (see docs/HANDOFF.md) instead of
// this raw cast once the schema exists.
function App() {
  const s = summarise(model as unknown as Model);

  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1>PMO — Cluster 1</h1>
      <p>Scaffold placeholder. Cluster total: {s.total.toLocaleString("en-US")} EGP</p>
      <p>Apartments: {s.apartments}</p>
      <p>See docs/HANDOFF.md for what to build next.</p>
    </main>
  );
}

export default App;
