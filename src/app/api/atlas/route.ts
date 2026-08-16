import { NextResponse } from "next/server";
import { getAtlasChapters } from "@/lib/atlas-catalog";

// Always read fresh from disk so newly added folders/images show up immediately.
export const dynamic = "force-dynamic";

export async function GET() {
  const chapters = await getAtlasChapters();
  return NextResponse.json({ chapters });
}
