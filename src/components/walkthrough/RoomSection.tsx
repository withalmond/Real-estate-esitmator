"use client";

import { useRef } from "react";
import { ROOM_TYPES, type RoomEntry } from "@/lib/walkthrough/types";
import { PhotoThumbnails } from "./PhotoThumbnails";

type RoomSectionProps = {
  room: RoomEntry;
  index: number;
  canRemove: boolean;
  isSaved: boolean;
  canAnalyze: boolean;
  savedPropertyId: string;
  savedRoomIds: Record<string, string>;
  isAnalyzing: boolean;
  analysisItems: RoomAnalysisItem[];
  analysisError: string;
  onChange: (room: RoomEntry) => void;
  onRemove: () => void;
  onAnalyze: () => void;
};

export type RoomAnalysisItem = {
  item: string;
  quantity: string;
};

function parsePositiveNumber(value: string): number | null {
  const n = parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function syncSquareFootage(room: RoomEntry): RoomEntry {
  const length = parsePositiveNumber(room.lengthFt);
  const width = parsePositiveNumber(room.widthFt);
  if (length !== null && width !== null) {
    const sqft = Math.round(length * width * 10) / 10;
    return { ...room, squareFootage: String(sqft) };
  }
  return room;
}

export function RoomSection({
  room,
  index,
  canRemove,
  isSaved,
  canAnalyze,
  savedPropertyId,
  savedRoomIds,
  isAnalyzing,
  analysisItems,
  analysisError,
  onChange,
  onRemove,
  onAnalyze,
}: RoomSectionProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);

  console.log("RoomSection saved room props", {
    roomId: room.id,
    savedPropertyId,
    savedRoomIds,
    isSaved,
    canAnalyze,
  });

  const update = (patch: Partial<RoomEntry>) => {
    let next = { ...room, ...patch };
    if ("lengthFt" in patch || "widthFt" in patch) {
      next = syncSquareFootage(next);
    }
    onChange(next);
  };

  const handlePhotosSelected = (files: FileList | null) => {
    if (!files?.length) return;

    const newPhotos = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    update({ photos: [...room.photos, ...newPhotos] });

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const removePhoto = (photoId: string) => {
    const removed = room.photos.find((p) => p.id === photoId);
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    update({
      photos: room.photos.filter((p) => p.id !== photoId),
    });
  };

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      aria-labelledby={`room-heading-${room.id}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2
          id={`room-heading-${room.id}`}
          className="text-lg font-semibold text-slate-900"
        >
          Room {index + 1}
        </h2>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Room type</span>
          <select
            value={room.roomType}
            onChange={(e) =>
              update({ roomType: e.target.value as RoomEntry["roomType"] })
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          >
            <option value="" disabled>
              Select room type…
            </option>
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-slate-700">
            Estimated dimensions &amp; square footage
          </legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Length (ft)</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                placeholder="0"
                value={room.lengthFt}
                onChange={(e) => update({ lengthFt: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Width (ft)</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                placeholder="0"
                value={room.widthFt}
                onChange={(e) => update({ widthFt: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
            <label className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-xs text-slate-500">Sq ft</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                placeholder="Auto or manual"
                value={room.squareFootage}
                onChange={(e) => update({ squareFootage: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>
          <p className="text-xs text-slate-500">
            Enter length and width to auto-calculate sq ft, or type sq ft directly.
          </p>
        </fieldset>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                AI material estimate
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Save the walkthrough first, then analyze this room using its uploaded photos.
              </p>
            </div>
            {logAnalyzeButtonState(room.id, isSaved, canAnalyze)}
            {isSaved && (
              <button
                type="button"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-300 disabled:active:scale-100"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Room"}
              </button>
            )}
          </div>

          <div aria-live="polite" className="mt-3 text-sm">
            {isAnalyzing && (
              <p className="font-medium text-blue-700">Analyzing room...</p>
            )}
            {!isAnalyzing && !isSaved && (
              <p className="text-slate-600">
                Save the property walkthrough before analyzing this room.
              </p>
            )}
            {!isAnalyzing && analysisError && (
              <p className="font-medium text-red-600">{analysisError}</p>
            )}
            {!isAnalyzing && analysisItems.length > 0 && (
              <ul className="mt-3 divide-y divide-blue-100 rounded-xl bg-white">
                {analysisItems.map((analysisItem) => (
                  <li
                    key={`${analysisItem.item}-${analysisItem.quantity}`}
                    className="flex items-start justify-between gap-3 px-3 py-2"
                  >
                    <span className="font-medium text-slate-800">
                      {analysisItem.item}
                    </span>
                    <span className="text-right text-slate-600">
                      {analysisItem.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Notes / dictation
          </span>
          <span className="text-xs text-slate-500">
            Tap the microphone on your keyboard to dictate (iPad &amp; phone).
          </span>
          <textarea
            rows={3}
            placeholder="Condition, finishes, issues, or other observations…"
            value={room.notes}
            onChange={(e) => update({ notes: e.target.value })}
            className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-slate-700">Room photos</span>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="sr-only"
            id={`camera-${room.id}`}
            onChange={(e) => handlePhotosSelected(e.target.files)}
          />
          <label
            htmlFor={`camera-${room.id}`}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 active:scale-[0.99]"
          >
            <CameraIcon />
            Snap photo with camera
          </label>
          <p className="text-xs text-slate-500">
            Use your device camera to capture multiple photos for this room. Each tap adds another shot.
          </p>
          <PhotoThumbnails photos={room.photos} onRemove={removePhoto} />
        </div>
      </div>
    </section>
  );
}

function logAnalyzeButtonState(
  roomId: string,
  isSaved: boolean,
  canAnalyze: boolean,
) {
  console.log("Analyze Room button visibility state", {
    roomId,
    isSaved,
    canAnalyze,
  });
  return null;
}

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
