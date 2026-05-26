import { NextResponse } from "next/server";
import {
  ROOM_IMAGES_BUCKET,
  createSupabaseAdminClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type IncomingPhoto = {
  fieldName: string;
};

type IncomingRoom = {
  clientId: string;
  roomType: string;
  lengthFt: string;
  widthFt: string;
  squareFootage: string;
  notes: string;
  photos: IncomingPhoto[];
};

type NormalizedRoom = Omit<IncomingRoom, "photos"> & {
  lengthFt: number | null;
  widthFt: number | null;
  squareFootage: number | null;
  notes: string | null;
  photos: File[];
};

type RoomInsert = {
  id: string;
  property_id: string;
  room_type: string;
  length_ft: number | null;
  width_ft: number | null;
  square_footage: number | null;
  notes: string | null;
  image_urls: string[];
};

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError("Expected a multipart form submission.");
  }

  const address = getRequiredString(formData, "propertyAddress");
  if (!address) {
    return jsonError("Property address is required.");
  }

  const parsedRooms = parseRooms(formData.get("rooms"));
  if ("error" in parsedRooms) {
    return jsonError(parsedRooms.error);
  }

  const normalizedRooms = normalizeRooms(parsedRooms.rooms, formData);
  if ("error" in normalizedRooms) {
    return jsonError(normalizedRooms.error);
  }

  let supabase: ReturnType<typeof createSupabaseAdminClient>;
  try {
    supabase = createSupabaseAdminClient();
  } catch (error) {
    console.error("Supabase is not configured", error);
    return jsonError("Supabase is not configured for this deployment.", 500);
  }

  const uploadedPaths: string[] = [];
  let createdPropertyId: string | null = null;

  try {
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({ address })
      .select("id")
      .single();

    if (propertyError || !property) {
      throw new Error(
        propertyError?.message ?? "Supabase did not return a property id.",
      );
    }

    createdPropertyId = property.id;

    const roomRows: RoomInsert[] = [];

    for (const room of normalizedRooms.rooms) {
      const roomId = crypto.randomUUID();
      const imageUrls: string[] = [];

      for (const file of room.photos) {
        const storagePath = buildStoragePath(
          createdPropertyId,
          roomId,
          file,
        );

        const { error: uploadError } = await supabase.storage
          .from(ROOM_IMAGES_BUCKET)
          .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Failed to upload image "${file.name}": ${uploadError.message}`,
          );
        }

        uploadedPaths.push(storagePath);

        const { data } = supabase.storage
          .from(ROOM_IMAGES_BUCKET)
          .getPublicUrl(storagePath);
        imageUrls.push(data.publicUrl);
      }

      roomRows.push({
        id: roomId,
        property_id: createdPropertyId,
        room_type: room.roomType,
        length_ft: room.lengthFt,
        width_ft: room.widthFt,
        square_footage: room.squareFootage,
        notes: room.notes,
        image_urls: imageUrls,
      });
    }

    const { error: roomsError } = await supabase.from("rooms").insert(roomRows);
    if (roomsError) {
      throw new Error(roomsError.message);
    }

    return NextResponse.json(
      {
        propertyId: createdPropertyId,
        roomsCreated: roomRows.length,
      },
      { status: 201 },
    );
  } catch (error) {
    await cleanupFailedSubmission(supabase, uploadedPaths, createdPropertyId);
    console.error("Failed to save property walkthrough", error);

    return jsonError(
      "Unable to save the property walkthrough. Please try again.",
      500,
    );
  }
}

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseRooms(
  value: FormDataEntryValue | null,
): { rooms: IncomingRoom[] } | { error: string } {
  if (typeof value !== "string") {
    return { error: "Rooms payload is required." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { error: "Rooms payload must be valid JSON." };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: "At least one room is required." };
  }

  const rooms: IncomingRoom[] = [];

  for (const item of parsed) {
    if (!isRecord(item)) {
      return { error: "Each room must be an object." };
    }

    const clientId = stringValue(item.clientId).trim();
    const roomType = stringValue(item.roomType).trim();
    const photos = Array.isArray(item.photos) ? item.photos : [];

    rooms.push({
      clientId,
      roomType,
      lengthFt: stringValue(item.lengthFt),
      widthFt: stringValue(item.widthFt),
      squareFootage: stringValue(item.squareFootage),
      notes: stringValue(item.notes),
      photos: photos.map((photo) => {
        if (!isRecord(photo)) {
          return { fieldName: "" };
        }

        return { fieldName: stringValue(photo.fieldName).trim() };
      }),
    });
  }

  return { rooms };
}

function normalizeRooms(
  rooms: IncomingRoom[],
  formData: FormData,
): { rooms: NormalizedRoom[] } | { error: string } {
  const normalizedRooms: NormalizedRoom[] = [];

  for (const [index, room] of rooms.entries()) {
    if (!room.clientId) {
      return { error: `Room ${index + 1} is missing its client id.` };
    }

    if (!room.roomType) {
      return { error: `Room ${index + 1} is missing its room type.` };
    }

    const lengthFt = parseOptionalNumber(room.lengthFt, "length", index);
    if ("error" in lengthFt) return lengthFt;

    const widthFt = parseOptionalNumber(room.widthFt, "width", index);
    if ("error" in widthFt) return widthFt;

    const squareFootage = parseOptionalNumber(
      room.squareFootage,
      "square footage",
      index,
    );
    if ("error" in squareFootage) return squareFootage;

    const files: File[] = [];
    for (const photo of room.photos) {
      if (!photo.fieldName) {
        return { error: `Room ${index + 1} has an invalid photo reference.` };
      }

      const value = formData.get(photo.fieldName);
      if (!(value instanceof File)) {
        return { error: `Room ${index + 1} is missing a photo file.` };
      }

      if (!value.type.startsWith("image/")) {
        return { error: `Room ${index + 1} includes a non-image file.` };
      }

      if (value.size > MAX_IMAGE_BYTES) {
        return {
          error: `Room ${index + 1} includes an image larger than 10 MB.`,
        };
      }

      files.push(value);
    }

    normalizedRooms.push({
      ...room,
      lengthFt: lengthFt.value,
      widthFt: widthFt.value,
      squareFootage: squareFootage.value,
      notes: room.notes.trim() || null,
      photos: files,
    });
  }

  return { rooms: normalizedRooms };
}

function parseOptionalNumber(
  rawValue: string,
  label: string,
  roomIndex: number,
): { value: number | null } | { error: string } {
  const value = rawValue.trim();
  if (!value) {
    return { value: null };
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return { error: `Room ${roomIndex + 1} has an invalid ${label}.` };
  }

  return { value: numberValue };
}

function buildStoragePath(propertyId: string, roomId: string, file: File) {
  return `${propertyId}/${roomId}/${crypto.randomUUID()}.${fileExtension(file)}`;
}

function fileExtension(file: File) {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (fileExtension?.match(/^[a-z0-9]+$/)) {
    return fileExtension;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "img";
  }
}

async function cleanupFailedSubmission(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  uploadedPaths: string[],
  propertyId: string | null,
) {
  if (uploadedPaths.length > 0) {
    await supabase.storage.from(ROOM_IMAGES_BUCKET).remove(uploadedPaths);
  }

  if (propertyId) {
    await supabase.from("properties").delete().eq("id", propertyId);
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
