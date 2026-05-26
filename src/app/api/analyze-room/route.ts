import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type AnalyzeRoomRequest = {
  roomId: string;
  propertyId: string;
};

type RoomRow = {
  id: string;
  property_id: string;
  room_type: string | null;
  length_ft: number | string | null;
  width_ft: number | string | null;
  square_footage: number | string | null;
  image_urls: unknown;
};

type AnalysisItem = {
  item: string;
  quantity: string;
};

const analysisSchema = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    properties: {
      item: {
        type: "string",
        description: "The repair or material item needed for the room.",
      },
      quantity: {
        type: "string",
        description:
          "The estimated quantity with units, calculated from the room dimensions and square footage when applicable.",
      },
    },
    required: ["item", "quantity"],
  },
} as const;

export async function POST(request: Request) {
  const parsedBody = await parseRequestBody(request);
  if ("error" in parsedBody) {
    return jsonError(parsedBody.error);
  }

  let supabase: ReturnType<typeof createSupabaseAdminClient>;
  try {
    supabase = createSupabaseAdminClient();
  } catch (error) {
    console.error("Supabase is not configured for room analysis", error);
    return jsonError("Supabase is not configured for this deployment.", 500);
  }

  const { data, error } = await supabase
    .from("rooms")
    .select(
      "id, property_id, room_type, length_ft, width_ft, square_footage, image_urls",
    )
    .eq("id", parsedBody.roomId)
    .eq("property_id", parsedBody.propertyId)
    .single();

  if (error || !data) {
    console.error("Failed to load room for analysis", error);
    return jsonError("Room was not found for the provided property.", 404);
  }

  const room = data as RoomRow;
  const imageUrls = normalizeImageUrls(room.image_urls);
  if (imageUrls.length === 0) {
    return jsonError("Room does not have any images to analyze.");
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonError("OpenAI is not configured for this deployment.", 500);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildAnalysisPrompt(room, imageUrls),
            },
            ...imageUrls.map((imageUrl) => ({
              type: "input_image" as const,
              image_url: imageUrl,
              detail: "auto" as const,
            })),
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "room_repair_material_quantities",
          description:
            "A strict JSON array of room repair and material quantity estimates.",
          schema: analysisSchema,
          strict: true,
        },
      },
    });

    const analysis = parseAnalysisResponse(response.output_text);
    if ("error" in analysis) {
      console.error("OpenAI returned invalid room analysis", analysis.error);
      return jsonError("Unable to analyze the room. Please try again.", 500);
    }

    return NextResponse.json(analysis.items);
  } catch (error) {
    console.error("Failed to analyze room with OpenAI", error);
    return jsonError("Unable to analyze the room. Please try again.", 500);
  }
}

async function parseRequestBody(
  request: Request,
): Promise<AnalyzeRoomRequest | { error: string }> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { error: "Expected a JSON request body." };
  }

  if (!isRecord(body)) {
    return { error: "Request body must be an object." };
  }

  const roomId = stringValue(body.roomId).trim();
  const propertyId = stringValue(body.propertyId).trim();

  if (!roomId) {
    return { error: "roomId is required." };
  }

  if (!propertyId) {
    return { error: "propertyId is required." };
  }

  return { roomId, propertyId };
}

function buildAnalysisPrompt(room: RoomRow, imageUrls: string[]) {
  const lengthFt = parseDatabaseNumber(room.length_ft);
  const widthFt = parseDatabaseNumber(room.width_ft);
  const squareFootage = parseDatabaseNumber(room.square_footage);

  return [
    "Analyze this room for necessary repairs and material quantities.",
    "Use the provided images to identify visible repair needs.",
    "Use the dimensions and square footage to calculate material quantities where applicable.",
    "Return only a strict JSON array. Each object must contain exactly these keys: item and quantity.",
    "",
    `Room type: ${room.room_type ?? "Unknown"}`,
    `Length: ${formatMeasurement(lengthFt, "ft")}`,
    `Width: ${formatMeasurement(widthFt, "ft")}`,
    `Square footage: ${formatMeasurement(squareFootage, "sq ft")}`,
    `Image count: ${imageUrls.length}`,
  ].join("\n");
}

function normalizeImageUrls(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((url): url is string => typeof url === "string")
    .map((url) => url.trim())
    .filter(Boolean);
}

function parseAnalysisResponse(
  value: string,
): { items: AnalysisItem[] } | { error: string } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    return { error: "Response was not valid JSON." };
  }

  if (!Array.isArray(parsed)) {
    return { error: "Response was not a JSON array." };
  }

  const items: AnalysisItem[] = [];

  for (const item of parsed) {
    if (!isRecord(item)) {
      return { error: "Response array contained a non-object item." };
    }

    const keys = Object.keys(item);
    if (
      keys.length !== 2 ||
      !keys.includes("item") ||
      !keys.includes("quantity")
    ) {
      return { error: "Response item did not contain exactly item and quantity." };
    }

    const itemName = stringValue(item.item).trim();
    const quantity = stringValue(item.quantity).trim();

    if (!itemName || !quantity) {
      return { error: "Response item contained an empty item or quantity." };
    }

    items.push({ item: itemName, quantity });
  }

  return { items };
}

function parseDatabaseNumber(value: number | string | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatMeasurement(value: number | null, unit: string) {
  return value === null ? "Not provided" : `${value} ${unit}`;
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
