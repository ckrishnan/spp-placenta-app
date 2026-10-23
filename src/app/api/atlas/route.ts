import { NextResponse } from "next/server";
import { getAtlasChapters } from "@/lib/atlas-catalog";

// Resolved at build time into a plain JSON file so the catalog works on static
// hosting (GitHub Pages cannot run a server-side route handler).
export const dynamic = "force-static";

export async function GET() {
  const chapters = await getAtlasChapters();
  return NextResponse.json({ chapters });
}
