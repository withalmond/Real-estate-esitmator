"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createEmptyRoom } from "@/lib/walkthrough/defaults";
import type { RoomEntry } from "@/lib/walkthrough/types";
import { RoomSection } from "./RoomSection";

export function PropertyWalkthroughForm() {
  const [propertyAddress, setPropertyAddress] = useState("");
  const [rooms, setRooms] = useState<RoomEntry[]>(() => [createEmptyRoom()]);
  const roomsRef = useRef(rooms);
  roomsRef.current = rooms;

  const addRoom = () => {
    setRooms((prev) => [...prev, createEmptyRoom()]);
  };

  const updateRoom = useCallback((id: string, room: RoomEntry) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? room : r)));
  }, []);

  const removeRoom = (id: string) => {
    setRooms((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target) {
        target.photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  useEffect(() => {
    return () => {
      roomsRef.current.forEach((room) => {
        room.photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      });
    };
  }, []);

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Step 1 — Property address
        </span>
        <input
          type="text"
          name="propertyAddress"
          autoComplete="street-address"
          placeholder="e.g. 742 Evergreen Terrace, Springfield"
          value={propertyAddress}
          onChange={(e) => setPropertyAddress(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-lg text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          required
        />
      </label>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Step 2 — Rooms
            </span>
            <p className="mt-1 text-sm text-slate-600">
              Add each space in the property. Capture dimensions, notes, and photos per room.
            </p>
          </div>
          <button
            type="button"
            onClick={addRoom}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <PlusIcon />
            Add room
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {rooms.map((room, index) => (
            <RoomSection
              key={room.id}
              room={room}
              index={index}
              canRemove={rooms.length > 1}
              onChange={(updated) => updateRoom(room.id, updated)}
              onRemove={() => removeRoom(room.id)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addRoom}
          className="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99]"
        >
          + Add another room
        </button>
      </div>
    </form>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
