import { supabase } from "./supabaseClient";
import { modelSchema } from "./schema";
import type { Model } from "../engine/engine";

/** Postgres `numeric` columns can come back from PostgREST as either a JSON
 *  number or a JSON string depending on version/config -- this hasn't been
 *  tested against the real API yet (see docs/HANDOFF.md "Phase 2"), so
 *  coerce defensively either way rather than assume one. */
const num = (v: unknown): number => (typeof v === "string" ? Number(v) : (v as number));
const numOrNull = (v: unknown): number | null => (v == null ? null : num(v));

/** Fetches the whole model from the live Supabase project and validates it
 *  against the same modelSchema seed.json uses, so a shape drift here fails
 *  as loudly as a hand-edited seed.json would. Requires an authenticated
 *  session -- RLS grants reads to `authenticated` only, nothing to `anon`. */
export async function fetchLiveModel(): Promise<Model> {
  const [clustersRes, activitiesRes, layoutsRes, buildingsRes] = await Promise.all([
    supabase.from("clusters").select("id, name"),
    supabase.from("activities").select("id, name, basis, uom, discipline, group"),
    supabase.from("layouts").select(
      "id, name, layout_unit_rates(activity_id, rate), spaces(space_key, name, floor_area, wall_area, space_rates(activity_id, rate))"
    ),
    supabase.from("buildings").select(
      "id, code, name, building_type, cluster_id, building_units(layout_id, count), lump_sums(scope, discipline, item, amount, substantiated, note)"
    ),
  ]);

  for (const res of [clustersRes, activitiesRes, layoutsRes, buildingsRes]) {
    if (res.error) throw new Error(`Failed to load live data: ${res.error.message}`);
  }

  const raw = {
    meta: { source: "live Supabase project" },
    clusters: clustersRes.data ?? [],
    activities: activitiesRes.data ?? [],
    layouts: (layoutsRes.data ?? []).map((l) => ({
      id: l.id,
      name: l.name,
      spaces: (l.spaces ?? []).map((s) => ({
        id: s.space_key,
        name: s.name,
        floor_area: numOrNull(s.floor_area),
        wall_area: numOrNull(s.wall_area),
        rates: Object.fromEntries((s.space_rates ?? []).map((r) => [r.activity_id, num(r.rate)])),
      })),
      unit_rates: Object.fromEntries((l.layout_unit_rates ?? []).map((r) => [r.activity_id, num(r.rate)])),
    })),
    buildings: (buildingsRes.data ?? []).map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      building_type: b.building_type,
      cluster_id: b.cluster_id,
      units: (b.building_units ?? []).map((u) => ({ layout_id: u.layout_id, count: u.count })),
      // note is a nullable Postgres column -> null when absent; modelSchema
      // (mirroring seed.json, where absence is an omitted key) wants it
      // omitted, not null. Normalized here, at the fetch boundary, not in
      // modelSchema or engine.ts -- see docs/HANDOFF.md "Phase 2".
      lump_sums: (b.lump_sums ?? []).map((ls) => ({
        scope: ls.scope,
        discipline: ls.discipline,
        item: ls.item,
        amount: num(ls.amount),
        substantiated: ls.substantiated,
        ...(ls.note != null ? { note: ls.note } : {}),
      })),
    })),
  };

  const result = modelSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Live data does not match the model schema:\n${result.error.message}`);
  }
  return result.data;
}
