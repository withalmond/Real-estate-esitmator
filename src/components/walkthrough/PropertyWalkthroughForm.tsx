"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createEmptyRoom } from "@/lib/walkthrough/defaults";
import type { RoomEntry } from "@/lib/walkthrough/types";
import { RoomSection } from "./RoomSection";

export function PropertyWalkthroughForm() {
  const [propertyAddress, setPropertyAddress] = useState("");
  const [rooms, setRooms] = useState<RoomEntry[]>(() => [createEmptyRoom()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!propertyAddress.trim()) {
      setErrorMessage("Enter a property address before saving.");
      return;
    }

    const missingRoomType = rooms.findIndex((room) => !room.roomType);
    if (missingRoomType !== -1) {
      setErrorMessage(`Select a room type for Room ${missingRoomType + 1}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/walkthroughs", {
        method: "POST",
        body: buildSubmissionFormData(propertyAddress, rooms),
      });
      const responseBody = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          responseBody?.error ?? "Unable to save the property walkthrough.",
        );
      }

      rooms.forEach((room) => {
        room.photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      });
      setPropertyAddress("");
      setRooms([createEmptyRoom()]);
      setStatusMessage("Property walkthrough saved.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the property walkthrough.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={handleSubmit}
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

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-300 disabled:active:scale-100"
        >
          {isSubmitting ? "Saving walkthrough..." : "Save property walkthrough"}
        </button>
        <div aria-live="polite" className="min-h-5 text-sm">
          {statusMessage && (
            <p className="font-medium text-green-700">{statusMessage}</p>
          )}
          {errorMessage && (
            <p className="font-medium text-red-600">{errorMessage}</p>
          )}
        </div>
      </div>
    </form>
  );
}

function buildSubmissionFormData(propertyAddress: string, rooms: RoomEntry[]) {
  const formData = new FormData();
  const roomPayload = rooms.map((room) => {
    const photos = room.photos.map((photo) => {
      const fieldName = `roomPhoto-${room.id}-${photo.id}`;
      formData.append(fieldName, photo.file, photo.file.name);
      return {
        fieldName,
        fileName: photo.file.name,
        contentType: photo.file.type,
      };
    });

    return {
      clientId: room.id,
      roomType: room.roomType,
      lengthFt: room.lengthFt,
      widthFt: room.widthFt,
      squareFootage: room.squareFootage,
      notes: room.notes,
      photos,
    };
  });

  formData.set("propertyAddress", propertyAddress.trim());
  formData.set("rooms", JSON.stringify(roomPayload));

  return formData;
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
