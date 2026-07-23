import { CARD, INK, INK_SOFT, RULE } from "../design/direction-c";
import { useRoute } from "../routing/router";

export interface NavItem {
  path: string;
  label: string;
  built: boolean;
}

/** Flip `built` to true as each screen ships — nothing else about
 *  navigation changes. */
export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Overview", built: true },
  { path: "/layouts", label: "Layouts", built: true },
  { path: "/activities", label: "Activities", built: false },
  { path: "/buildings", label: "Buildings", built: false },
  { path: "/rates", label: "Rates", built: false },
];

export function ScreenNav() {
  const [path, navigate] = useRoute();

  return (
    <nav className="flex flex-wrap gap-2.5" aria-label="Screens">
      {NAV_ITEMS.map((item) => {
        const isCurrent = item.path === path;
        if (!item.built) {
          return (
            <span
              key={item.path}
              className="rounded-full border px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: CARD, borderColor: RULE, color: INK_SOFT }}
              aria-disabled="true"
              title="Not built yet"
            >
              {item.label} →
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
            className="rounded-full border px-4 py-2 text-sm font-semibold no-underline"
            style={{
              backgroundColor: isCurrent ? INK : CARD,
              borderColor: isCurrent ? INK : RULE,
              color: isCurrent ? CARD : INK,
            }}
          >
            {item.label} {isCurrent ? "" : "→"}
          </a>
        );
      })}
    </nav>
  );
}
