import { Building, TrendingUp } from "lucide-react";

import { ActiveWalkthroughsList } from "@/components/dashboard/active-walkthroughs-list";
import { StickyBottomCta } from "@/components/dashboard/sticky-bottom-cta";
import { ACTIVE_WALKTHROUGHS } from "@/lib/mock-walkthroughs";

export function Dashboard() {
  const activeCount = ACTIVE_WALKTHROUGHS.length;
  const inProgressCount = ACTIVE_WALKTHROUGHS.filter(
    (w) => w.status === "in_progress"
  ).length;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="safe-area-top sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto w-full max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Acquisitions
              </p>
              <h1 className="text-xl font-bold tracking-tight">Walkthroughs</h1>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building className="size-5" aria-hidden />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-card px-3 py-2.5">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-lg font-bold tabular-nums">{activeCount}</p>
            </div>
            <div className="rounded-xl border bg-card px-3 py-2.5">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="size-3" aria-hidden />
                In Progress
              </p>
              <p className="text-lg font-bold tabular-nums">{inProgressCount}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <section aria-labelledby="active-walkthroughs-heading">
          <div className="mb-4 flex items-baseline justify-between">
            <h2
              id="active-walkthroughs-heading"
              className="text-base font-semibold"
            >
              Active Property Walkthroughs
            </h2>
            <span className="text-sm text-muted-foreground tabular-nums">
              {activeCount}
            </span>
          </div>
          <ActiveWalkthroughsList />
        </section>
      </main>

      <StickyBottomCta />
    </div>
  );
}
