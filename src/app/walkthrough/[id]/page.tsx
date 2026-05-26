import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ACTIVE_WALKTHROUGHS,
  formatCurrency,
  formatRelativeTime,
  STATUS_LABELS,
} from "@/lib/mock-walkthroughs";

interface WalkthroughDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WalkthroughDetailPage({
  params,
}: WalkthroughDetailPageProps) {
  const { id } = await params;
  const walkthrough = ACTIVE_WALKTHROUGHS.find((w) => w.id === id);

  if (!walkthrough) {
    notFound();
  }

  const {
    address,
    city,
    state,
    propertyType,
    status,
    assignedTo,
    lastUpdated,
    units,
    askingPrice,
  } = walkthrough;

  return (
    <div className="flex min-h-dvh flex-col safe-area-top">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/" aria-label="Back to dashboard">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">{address}</h1>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {city}, {state}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6">
        <div className="flex flex-wrap gap-2">
          <Badge>{STATUS_LABELS[status]}</Badge>
          <Badge variant="muted">{propertyType}</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned to</span>
              <span className="flex items-center gap-1 font-medium">
                <User className="size-3.5" aria-hidden />
                {assignedTo}
              </span>
            </div>
            {askingPrice != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asking price</span>
                <span className="font-medium">{formatCurrency(askingPrice)}</span>
              </div>
            )}
            {units != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units</span>
                <span className="font-medium">{units}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last updated</span>
              <span className="font-medium">{formatRelativeTime(lastUpdated)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Walkthrough Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Photo capture, condition notes, and financial assumptions will
              appear here as the walkthrough flow is built out.
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="safe-area-bottom border-t bg-background/80 px-4 py-4 backdrop-blur-lg">
        <Button size="xl" className="h-14 w-full">
          Resume Walkthrough
        </Button>
      </footer>
    </div>
  );
}
