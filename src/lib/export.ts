import type { Model } from "../engine/engine";

/** Shared by the Rates screen's "Export JSON" and the top bar's "Download
 *  report" — same action, same file, so there's exactly one thing "export"
 *  means in this app. */
export function downloadModelJson(model: Model) {
  const blob = new Blob([JSON.stringify(model, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cluster-1-edited.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
