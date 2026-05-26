import Link from "next/link";

import { Button } from "@/components/ui/button";

export function StickyBottomCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 backdrop-blur-lg safe-area-bottom"
      role="region"
      aria-label="Primary action"
    >
      <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-3">
        <Button
          asChild
          size="xl"
          className="h-14 w-full text-base shadow-lg shadow-primary/20"
        >
          <Link href="/walkthrough/new">+ Start New Property Walkthrough</Link>
        </Button>
      </div>
    </div>
  );
}
