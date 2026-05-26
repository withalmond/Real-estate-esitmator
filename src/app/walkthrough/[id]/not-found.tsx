import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function WalkthroughNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">Walkthrough not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This property walkthrough does not exist or was removed.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
