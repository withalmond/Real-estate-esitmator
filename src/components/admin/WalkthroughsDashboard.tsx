"use client";

import { Fragment, useState, type ReactNode } from "react";

export type AdminRoom = {
  id: string;
  roomType: string;
  lengthFt: number | null;
  widthFt: number | null;
  squareFootage: number | null;
  notes: string | null;
  imageUrls: string[];
};

export type AdminWalkthrough = {
  id: string;
  address: string;
  submittedAt: string;
  submittedAtLabel: string;
  totalRooms: number;
  totalSquareFootage: number;
  rooms: AdminRoom[];
};

type WalkthroughsDashboardProps = {
  walkthroughs: AdminWalkthrough[];
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

export function WalkthroughsDashboard({
  walkthroughs,
}: WalkthroughsDashboardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    walkthroughs[0]?.id ?? null,
  );

  const totalRooms = walkthroughs.reduce(
    (total, walkthrough) => total + walkthrough.totalRooms,
    0,
  );
  const totalSquareFootage = walkthroughs.reduce(
    (total, walkthrough) => total + walkthrough.totalSquareFootage,
    0,
  );
  const totalPhotos = walkthroughs.reduce(
    (total, walkthrough) =>
      total +
      walkthrough.rooms.reduce(
        (roomTotal, room) => roomTotal + room.imageUrls.length,
        0,
      ),
    0,
  );

  if (walkthroughs.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          No submissions yet
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          Property walkthroughs will appear here.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Once field teams submit property details, the office team can review
          room counts, footage, notes, dimensions, and photos from this
          dashboard.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section
        className="grid gap-4 md:grid-cols-3"
        aria-label="Walkthrough summary"
      >
        <MetricCard label="Submitted properties" value={walkthroughs.length} />
        <MetricCard label="Rooms logged" value={totalRooms} />
        <MetricCard
          label="Documented square footage"
          value={`${formatNumber(totalSquareFootage)} sq ft`}
          helper={`${totalPhotos} photos attached`}
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Walkthrough submissions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Sorted by newest submission first. Select a property to review
                room-level details.
              </p>
            </div>
            <p className="text-sm font-medium text-slate-500">
              {walkthroughs.length} total
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <ColumnHeader>Property Address</ColumnHeader>
                <ColumnHeader>Total Rooms Logged</ColumnHeader>
                <ColumnHeader>Total Sq Footage</ColumnHeader>
                <ColumnHeader>Date</ColumnHeader>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {walkthroughs.map((walkthrough) => {
                const isExpanded = expandedId === walkthrough.id;

                return (
                  <Fragment key={walkthrough.id}>
                    <tr
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-controls={`walkthrough-details-${walkthrough.id}`}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : walkthrough.id)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setExpandedId(isExpanded ? null : walkthrough.id);
                        }
                      }}
                      className={`cursor-pointer transition hover:bg-blue-50/60 focus:bg-blue-50/60 focus:outline-none ${
                        isExpanded ? "bg-blue-50/70" : ""
                      }`}
                    >
                      <td className="max-w-[24rem] px-5 py-4 sm:px-6">
                        <div className="font-semibold text-slate-950">
                          {walkthrough.address}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Submitted {walkthrough.submittedAtLabel}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700 sm:px-6">
                        {walkthrough.totalRooms}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700 sm:px-6">
                        {formatNumber(walkthrough.totalSquareFootage)} sq ft
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
                        <time dateTime={walkthrough.submittedAt}>
                          {walkthrough.submittedAtLabel}
                        </time>
                      </td>
                      <td className="px-5 py-4 text-right sm:px-6">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                          {isExpanded ? "Hide rooms" : "View rooms"}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td
                          id={`walkthrough-details-${walkthrough.id}`}
                          colSpan={5}
                          className="bg-slate-50 px-4 py-5 sm:px-6"
                        >
                          <WalkthroughDetails walkthrough={walkthrough} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      {helper && <p className="mt-2 text-sm text-slate-500">{helper}</p>}
    </div>
  );
}

function ColumnHeader({ children }: { children: ReactNode }) {
  return (
    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
      {children}
    </th>
  );
}

function WalkthroughDetails({
  walkthrough,
}: {
  walkthrough: AdminWalkthrough;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            Room-by-room breakdown
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {walkthrough.totalRooms} rooms &middot;{" "}
            {formatNumber(walkthrough.totalSquareFootage)} total sq ft
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
          Property ID:{" "}
          <span className="font-mono text-xs text-slate-700">
            {walkthrough.id}
          </span>
        </div>
      </div>

      {walkthrough.rooms.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">
          No room records were logged for this property.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {walkthrough.rooms.map((room, index) => (
            <RoomBreakdownCard key={room.id} room={room} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoomBreakdownCard({
  room,
  index,
}: {
  room: AdminRoom;
  index: number;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Room {index + 1}
          </p>
          <h4 className="mt-1 text-base font-semibold text-slate-950">
            {room.roomType}
          </h4>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {room.squareFootage === null
            ? "No sq ft"
            : `${formatNumber(room.squareFootage)} sq ft`}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <dl className="grid grid-cols-3 gap-3">
          <DimensionStat label="Length" value={formatMeasurement(room.lengthFt)} />
          <DimensionStat label="Width" value={formatMeasurement(room.widthFt)} />
          <DimensionStat
            label="Sq ft"
            value={
              room.squareFootage === null
                ? "Not logged"
                : formatNumber(room.squareFootage)
            }
          />
        </dl>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </p>
          <p className="mt-2 min-h-16 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            {room.notes || "No notes logged for this room."}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Photo gallery
            </p>
            <p className="text-xs font-medium text-slate-400">
              {room.imageUrls.length} images
            </p>
          </div>
          {room.imageUrls.length === 0 ? (
            <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No photos uploaded for this room.
            </div>
          ) : (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {room.imageUrls.map((imageUrl, photoIndex) => (
                <li
                  key={`${room.id}-${imageUrl}`}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm"
                >
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block h-full w-full"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`${room.roomType} photo ${photoIndex + 1}`}
                      className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

function DimensionStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function formatMeasurement(value: number | null) {
  if (value === null) {
    return "Not logged";
  }

  return `${formatNumber(value)} ft`;
}

function formatNumber(value: number) {
  return numberFormatter.format(value);
}
