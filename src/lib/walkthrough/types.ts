export const ROOM_TYPES = [
  "Kitchen",
  "Living Room",
  "Master Bed",
  "Bathroom",
  "Exterior Front",
  "Exterior Back",
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

export type RoomPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

export type RoomEntry = {
  id: string;
  roomType: RoomType | "";
  lengthFt: string;
  widthFt: string;
  squareFootage: string;
  notes: string;
  photos: RoomPhoto[];
};

export type WalkthroughFormState = {
  propertyAddress: string;
  rooms: RoomEntry[];
};
