import type { ReactNode } from "react";
import { useModel } from "../data/ModelContext";
import { downloadModelJson } from "../lib/export";
import { useRoute } from "../routing/router";

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  built: boolean;
}

/** Flip `built` to true as each screen ships — nothing else about
 *  navigation changes. Icons are Material Symbols names (see index.html for
 *  the font import). */
export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Overview", icon: "dashboard", built: true },
  { path: "/layouts", label: "Layouts", icon: "apartment", built: true },
  { path: "/activities", label: "Activities", icon: "construction", built: true },
  { path: "/buildings", label: "Buildings", icon: "domain", built: true },
  { path: "/rates", label: "Rates", icon: "tune", built: true },
];

function TopBar() {
  const { model } = useModel();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant h-20">
      <div className="flex justify-between items-center w-full px-4 md:px-10 h-full max-w-[1440px] mx-auto">
        <div className="text-body-lg md:text-headline-md font-semibold text-primary whitespace-nowrap">
          <span className="md:hidden">Capital dashboard</span>
          <span className="hidden md:inline">Capital executive dashboard</span>
        </div>
        <nav className="hidden md:flex gap-6 items-center" aria-label="Sections">
          <span className="text-headline-sm font-semibold text-primary border-b-2 border-primary pb-1">Portfolio</span>
          {["Projects", "Financials", "Compliance"].map((label) => (
            <span
              key={label}
              className="text-headline-sm text-secondary opacity-50 px-2 py-1 cursor-not-allowed"
              title="Not built yet"
              aria-disabled="true"
            >
              {label}
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="material-symbols-outlined text-on-surface-variant p-2 rounded opacity-50 cursor-not-allowed"
            title="Not built yet"
            aria-disabled="true"
          >
            notifications
          </button>
          <button
            type="button"
            className="material-symbols-outlined text-on-surface-variant p-2 rounded opacity-50 cursor-not-allowed"
            title="Not built yet"
            aria-disabled="true"
          >
            settings
          </button>
          <button
            type="button"
            onClick={() => downloadModelJson(model)}
            className="bg-primary text-on-primary px-4 py-2 rounded text-body-md font-medium hover:opacity-80 transition-opacity"
          >
            Download report
          </button>
        </div>
      </div>
    </header>
  );
}

function SideNav() {
  const { model } = useModel();
  const { pathname, navigate } = useRoute();
  const clusterName = model.clusters[0]?.name ?? "Cluster";

  return (
    <aside className="hidden md:flex fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-surface border-r border-outline-variant flex-col py-6">
      <div className="px-4 mb-6">
        <div className="text-headline-sm font-semibold text-primary">{clusterName}</div>
        <div className="text-on-surface-variant text-label-sm">{model.meta.revision}</div>
      </div>
      <nav className="flex-1 space-y-1 px-2" aria-label="Screens">
        {NAV_ITEMS.map((item) => {
          const isCurrent = item.path === pathname;
          if (!item.built) {
            return (
              <span
                key={item.path}
                className="text-on-surface-variant opacity-50 flex items-center gap-3 px-4 py-3 rounded cursor-not-allowed"
                title="Not built yet"
                aria-disabled="true"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-body-md">{item.label}</span>
              </span>
            );
          }
          return (
            <a
              key={item.path}
              href={item.path}
              aria-current={isCurrent ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded transition-all no-underline ${
                isCurrent
                  ? "bg-secondary-container text-on-secondary-container font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-body-md">{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="px-2">
        <a
          className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-3 px-4 py-3 rounded opacity-70"
          href="#"
          title="Not built yet"
          onClick={(e) => e.preventDefault()}
          aria-disabled="true"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="text-body-md">Help center</span>
        </a>
      </div>
    </aside>
  );
}

/** Sidebar is desktop-only (see SideNav's `hidden md:flex`) — a 256px fixed
 *  rail has nowhere to go at 375px. This is the mobile equivalent: same
 *  NAV_ITEMS, same routing, a bottom tab bar instead. */
function MobileNav() {
  const { pathname, navigate } = useRoute();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest border-t border-outline-variant flex"
      aria-label="Screens"
    >
      {NAV_ITEMS.map((item) => {
        const isCurrent = item.path === pathname;
        return (
          <a
            key={item.path}
            href={item.built ? item.path : undefined}
            aria-current={isCurrent ? "page" : undefined}
            aria-disabled={!item.built}
            title={item.built ? undefined : "Not built yet"}
            onClick={(e) => {
              e.preventDefault();
              if (item.built) navigate(item.path);
            }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 no-underline ${
              !item.built
                ? "text-on-surface-variant opacity-40"
                : isCurrent
                  ? "text-primary font-semibold"
                  : "text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-label-sm">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <TopBar />
      <SideNav />
      <main className="md:ml-64 mt-20 pb-16 md:pb-0 min-h-[calc(100vh-80px)]">{children}</main>
      <MobileNav />
    </div>
  );
}
