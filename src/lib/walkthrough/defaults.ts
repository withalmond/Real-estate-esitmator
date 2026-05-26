import type { RoomEntry } from "./types";

export function createEmptyRoom(): RoomEntry {
  return {
    id: crypto.randomUUID(),
    roomType: "",
    lengthFt: "",
    widthFt: "",
    squareFootage: "",
    notes: "",
    photos: [],
  };
}
