import { type NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const existing = db.prepare("SELECT id FROM exercise_logs WHERE id = ?").get(id);
  if (!existing) {
    return Response.json({ error: "exercise log not found" }, { status: 404 });
  }
  db.prepare("DELETE FROM exercise_logs WHERE id = ?").run(id);
  return new Response(null, { status: 204 });
}
