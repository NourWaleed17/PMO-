import { z } from "zod";

const basisSchema = z.enum(["floor_area", "wall_area", "per_unit"]);

const activitySchema = z.object({
  id: z.string(),
  name: z.string(),
  basis: basisSchema,
  uom: z.string(),
  discipline: z.string(),
  group: z.string(),
});

const spaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  floor_area: z.number().nullable(),
  wall_area: z.number().nullable(),
  rates: z.record(z.string(), z.number()),
});

const layoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  spaces: z.array(spaceSchema),
  unit_rates: z.record(z.string(), z.number()),
});

const lumpSumSchema = z.object({
  scope: z.string(),
  discipline: z.string(),
  item: z.string(),
  amount: z.number(),
  substantiated: z.boolean(),
  note: z.string().optional(),
});

const buildingSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  building_type: z.string(),
  cluster_id: z.string(),
  units: z.array(z.object({ layout_id: z.string(), count: z.number() })),
  lump_sums: z.array(lumpSumSchema),
});

export const modelSchema = z.object({
  meta: z.record(z.string(), z.string()),
  clusters: z.array(z.object({ id: z.string(), name: z.string() })),
  activities: z.array(activitySchema),
  layouts: z.array(layoutSchema),
  buildings: z.array(buildingSchema),
});
