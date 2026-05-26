import Link from "next/link";
import {
  WalkthroughsDashboard,
  type AdminRoom,
  type AdminWalkthrough,
} from "@/components/admin/WalkthroughsDashboard";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Admin Walkthroughs | Real Estate Estimator",
  description: "Review submitted property walkthroughs and room details.",
  robots: {
    index: false,
    follow: false,
  },
};

type RoomRow = {
  id: string;
  room_type: string;
  length_ft: number | string | null;
  width_ft: number | string | null;
  square_footage: number | string | null;
  notes: string | null;
  image_urls: string[] | null;
  created_at: string;
};

type PropertyRow = {
  id: string;
  address: string;
  created_at: string;
  rooms: RoomRow[] | null;
};

type WalkthroughsState =
  | { walkthroughs: AdminWalkthrough[]; error: null }
  | { walkthroughs: []; error: string };

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export default async function AdminWalkthroughsPage() {
  const { walkthroughs, error } = await getWalkthroughs();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            >
              <span aria-hidden>&larr;</span>
              Home
            </Link>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
              Internal admin
            </span>
          </div>

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              Operations dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Submitted property walkthroughs
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Review incoming property submissions, room totals, dimensions,
              field notes, and public storage photo galleries from one place.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <ConfigurationError message={error} />
        ) : (
          <WalkthroughsDashboard walkthroughs={walkthroughs} />
        )}
      </main>
    </div>
  );
}

async function getWalkthroughs(): Promise<WalkthroughsState> {
  let supabase: ReturnType<typeof createSupabaseAdminClient>;

  try {
    supabase = createSupabaseAdminClient();
  } catch (error) {
    console.error("Supabase is not configured for admin walkthroughs", error);
    return {
      walkthroughs: [],
      error:
        "Supabase is not configured. Add SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY to load walkthroughs.",
    };
  }

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
        id,
        address,
        created_at,
        rooms (
          id,
          room_type,
          length_ft,
          width_ft,
          square_footage,
          notes,
          image_urls,
          created_at
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch admin walkthroughs", error);
    return {
      walkthroughs: [],
      error: "Unable to load submitted walkthroughs from Supabase.",
    };
  }

  return {
    walkthroughs: normalizeProperties((data ?? []) as PropertyRow[]),
    error: null,
  };
}

function normalizeProperties(properties: PropertyRow[]): AdminWalkthrough[] {
  return properties.map((property) => {
    const rooms = (property.rooms ?? [])
      .map(normalizeRoom)
      .sort((a, b) => a.sortDate.localeCompare(b.sortDate))
      .map(({ sortDate: _sortDate, ...room }) => room);

    return {
      id: property.id,
      address: property.address,
      submittedAt: property.created_at,
      submittedAtLabel: formatDate(property.created_at),
      totalRooms: rooms.length,
      totalSquareFootage: rooms.reduce(
        (total, room) => total + (room.squareFootage ?? 0),
        0,
      ),
      rooms,
    };
  });
}

function normalizeRoom(room: RoomRow): AdminRoom & { sortDate: string } {
  return {
    id: room.id,
    roomType: room.room_type,
    lengthFt: parseDatabaseNumber(room.length_ft),
    widthFt: parseDatabaseNumber(room.width_ft),
    squareFootage: parseDatabaseNumber(room.square_footage),
    notes: room.notes,
    imageUrls: Array.isArray(room.image_urls) ? room.image_urls : [],
    sortDate: room.created_at,
  };
}

function parseDatabaseNumber(value: number | string | null) {
  if (value === null) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Unknown date";
  }

  return dateFormatter.format(date);
}

function ConfigurationError({ message }: { message: string }) {
  return (
    <section className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
        Dashboard unavailable
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-red-950">
        Unable to load walkthrough data
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-red-800">
        {message}
      </p>
    </section>
  );
}
