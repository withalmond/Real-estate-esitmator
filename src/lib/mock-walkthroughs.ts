export type WalkthroughStatus = "in_progress" | "scheduled" | "review";

export interface PropertyWalkthrough {
  id: string;
  address: string;
  city: string;
  state: string;
  propertyType: string;
  status: WalkthroughStatus;
  assignedTo: string;
  lastUpdated: string;
  units?: number;
  askingPrice?: number;
}

export const ACTIVE_WALKTHROUGHS: PropertyWalkthrough[] = [
  {
    id: "wt-001",
    address: "1842 Maple Ridge Dr",
    city: "Austin",
    state: "TX",
    propertyType: "Multifamily",
    status: "in_progress",
    assignedTo: "Jordan M.",
    lastUpdated: "2026-05-24T14:30:00Z",
    units: 24,
    askingPrice: 4200000,
  },
  {
    id: "wt-002",
    address: "901 Commerce St, Unit B",
    city: "Dallas",
    state: "TX",
    propertyType: "Mixed-Use",
    status: "scheduled",
    assignedTo: "Alex K.",
    lastUpdated: "2026-05-23T09:15:00Z",
    units: 8,
    askingPrice: 1850000,
  },
  {
    id: "wt-003",
    address: "4550 Westheimer Rd",
    city: "Houston",
    state: "TX",
    propertyType: "Retail",
    status: "review",
    assignedTo: "Sam R.",
    lastUpdated: "2026-05-22T16:45:00Z",
    askingPrice: 2900000,
  },
  {
    id: "wt-004",
    address: "220 N Lamar Blvd",
    city: "Austin",
    state: "TX",
    propertyType: "Office",
    status: "in_progress",
    assignedTo: "Jordan M.",
    lastUpdated: "2026-05-25T08:00:00Z",
    askingPrice: 5100000,
  },
  {
    id: "wt-005",
    address: "118 Cypress Creek Ln",
    city: "San Antonio",
    state: "TX",
    propertyType: "Industrial",
    status: "scheduled",
    assignedTo: "Taylor P.",
    lastUpdated: "2026-05-21T11:20:00Z",
    askingPrice: 3400000,
  },
];

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const STATUS_LABELS: Record<WalkthroughStatus, string> = {
  in_progress: "In Progress",
  scheduled: "Scheduled",
  review: "Under Review",
};
