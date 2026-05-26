"use client";

import type { RoomPhoto } from "@/lib/walkthrough/types";

type PhotoThumbnailsProps = {
  photos: RoomPhoto[];
  onRemove: (photoId: string) => void;
};

export function PhotoThumbnails({ photos, onRemove }: PhotoThumbnailsProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Captured room photos">
      {photos.map((photo) => (
        <li key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.previewUrl}
            alt="Room photo preview"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(photo.id)}
            className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm font-bold text-white opacity-100 transition hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
            aria-label="Remove photo"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
