import Link from "next/link";
import { ArrowLeft, MapPin, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewWalkthroughPage() {
  return (
    <div className="flex min-h-dvh flex-col safe-area-top">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/" aria-label="Back to dashboard">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">New Walkthrough</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-primary" aria-hidden />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the property address to begin your walkthrough. Full form
              fields will be added in the next iteration.
            </p>

            <div className="space-y-3">
              <label className="block text-sm font-medium" htmlFor="address">
                Street Address
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="address"
                  type="text"
                  placeholder="e.g. 1842 Maple Ridge Dr"
                  className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    placeholder="Austin"
                    className="mt-1.5 h-12 w-full rounded-xl border bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium" htmlFor="state">
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    placeholder="TX"
                    maxLength={2}
                    className="mt-1.5 h-12 w-full rounded-xl border bg-background px-4 text-base uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="safe-area-bottom border-t bg-background/80 px-4 py-4 backdrop-blur-lg">
        <Button size="xl" className="h-14 w-full" disabled>
          Continue to Walkthrough
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Complete address to continue
        </p>
      </footer>
    </div>
  );
}
