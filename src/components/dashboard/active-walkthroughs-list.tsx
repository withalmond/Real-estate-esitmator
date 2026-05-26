import { WalkthroughCard } from "@/components/dashboard/walkthrough-card";
import { ACTIVE_WALKTHROUGHS } from "@/lib/mock-walkthroughs";

export function ActiveWalkthroughsList() {
  const walkthroughs = ACTIVE_WALKTHROUGHS;

  if (walkthroughs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          No active walkthroughs
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Start a new property walkthrough to begin
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3" role="list">
      {walkthroughs.map((walkthrough) => (
        <li key={walkthrough.id}>
          <WalkthroughCard walkthrough={walkthrough} />
        </li>
      ))}
    </ul>
  );
}
