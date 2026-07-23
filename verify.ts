import { readFileSync } from "fs";
import { Model, summarise, layoutTotal, layoutCost } from "./src/engine";

const model: Model = JSON.parse(readFileSync("seed.json", "utf8"));
const s = summarise(model);
const f = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

console.log("cost per apartment (engine vs sheet)");
const sheet: Record<string, number> = {
  edge: 393303.17, middle: 383807.46, apt_1: 301537.10, apt_2: 294250.20, apt_3: 295376.87 };
for (const l of model.layouts) {
  const t = layoutTotal(l, model.activities);
  const d = t - sheet[l.id];
  console.log(`  ${l.name.padEnd(18)} ${f(t).padStart(12)}  sheet ${f(sheet[l.id]).padStart(12)}  Δ ${f(d).padStart(10)}`);
}

const aptOnly = Object.values(s.byActivity).reduce((a, b) => a + b, 0);
console.log("\napartment finishes  ", f(aptOnly), "   sheet 34,235,396.02   Δ", f(aptOnly - 34235396.02));
console.log("cluster total       ", f(s.total), "  sheet 147,666,678.02   Δ", f(s.total - 147666678.02));
console.log("apartments          ", s.apartments);
console.log("unsubstantiated     ", f(s.unsubstantiated), `(${(100*s.unsubstantiated/s.total).toFixed(1)}%)`);

console.log("\nby activity");
for (const [k, v] of Object.entries(s.byActivity).sort((a, b) => b[1] - a[1]))
  console.log(`  ${k.padEnd(20)} ${f(v).padStart(14)}`);
console.log("\nby building");
for (const [k, v] of Object.entries(s.byBuilding)) console.log(`  ${k.padEnd(20)} ${f(v).padStart(14)}`);
