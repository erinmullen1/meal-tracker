import { type NextRequest } from "next/server";
import { analyzeMeal } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { description } = body as { description: string };

  if (!description?.trim()) {
    return Response.json({ error: "description is required" }, { status: 400 });
  }

  const analysis = await analyzeMeal(description);
  return Response.json(analysis);
}
