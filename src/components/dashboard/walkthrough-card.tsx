import Link from "next/link";
import { ChevronRight, Building2, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatRelativeTime,
  STATUS_LABELS,
  type PropertyWalkthrough,
} from "@/lib/mock-walkthroughs";
import { cn } from "@/lib/utils";

const statusVariant: Record<
  PropertyWalkthrough["status"],
  "default" | "warning" | "success"
> = {
  in_progress: "default",
  scheduled: "warning",
  review: "success",
};

interface WalkthroughCardProps {
  walkthrough: PropertyWalkthrough;
}

export function WalkthroughCard({ walkthrough }: WalkthroughCardProps) {
  const { id, address, city, state, propertyType, status, assignedTo, lastUpdated, units, askingPrice } =
    walkthrough;

  return (
    <Link
      href={`/walkthrough/${id}`}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl border bg-card p-4",
        "shadow-sm transition-all active:scale-[0.99]",
        "hover:border-primary/30 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Building2 className="size-5" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold leading-tight">
            {address}
          </h3>
          <ChevronRight
            className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>

        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {city}, {state}
          </span>
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant[status]}>
            {STATUS_LABELS[status]}
          </Badge>
          <span className="text-xs text-muted-foreground">{propertyType}</span>
          {units != null && (
            <span className="text-xs text-muted-foreground">
              · {units} units
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{assignedTo}</span>
          <div className="flex items-center gap-2">
            {askingPrice != null && (
              <span className="font-medium text-foreground">
                {formatCurrency(askingPrice)}
              </span>
            )}
            <span>{formatRelativeTime(lastUpdated)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
