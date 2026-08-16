// Server-only module. Builds the Picture Atlas catalog by scanning the folder
// structure of `public/images/atlas/` and merging in curated metadata from the
// `placeholder-images.json` manifest (when a matching entry exists).
//
// Every subfolder becomes a chapter, and every image file inside it is listed
// automatically. To add a new chapter a developer only needs to create a new
// folder and drop image files into it — no code changes required.

import fs from "fs/promises";
import path from "path";
import manifest from "./placeholder-images.json";
import type { AtlasChapter, AtlasImage } from "./atlas-types";

const ATLAS_ROOT = path.join(process.cwd(), "public", "images", "atlas");

const IMAGE_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".tif",
  ".tiff",
  ".avif",
]);

function slugify(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function titleCase(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export async function getAtlasChapters(): Promise<AtlasChapter[]> {
  // Look up curated metadata from the manifest by normalized image path.
  const manifestImages = manifest.placeholderImages ?? [];
  const byPath = new Map<string, (typeof manifestImages)[number]>();
  for (const image of manifestImages) {
    byPath.set(image.imageUrl.toLowerCase(), image);
  }

  let entries;
  try {
    entries = await fs.readdir(ATLAS_ROOT, { withFileTypes: true });
  } catch {
    return [];
  }

  // Reserve curated ids up front so derived slugs never collide with them.
  const usedIds = new Set<string>(manifestImages.map((i) => i.id));
  const uniqueId = (base: string): string => {
    let id = base;
    let n = 2;
    while (usedIds.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    usedIds.add(id);
    return id;
  };

  const chapters: AtlasChapter[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

    let files: string[] = [];
    try {
      files = await fs.readdir(path.join(ATLAS_ROOT, entry.name));
    } catch {
      continue;
    }

    const images: AtlasImage[] = files
      .filter((fileName) => IMAGE_EXTS.has(path.extname(fileName).toLowerCase()))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
      )
      .map((fileName) => {
        const imageUrl = `/images/atlas/${entry.name}/${fileName}`;
        const curated = byPath.get(imageUrl.toLowerCase());
        const base = fileName.replace(/\.[^.]+$/, "");
        const id = curated ? curated.id : uniqueId(slugify(fileName));
        return {
          id,
          fileName,
          imageUrl,
          description: curated?.description ?? titleCase(base),
          imageHint: curated?.imageHint ?? "",
        };
      });

    if (images.length === 0) continue;

    chapters.push({
      folder: entry.name,
      title: titleCase(entry.name),
      images,
    });
  }

  chapters.sort((a, b) =>
    a.folder.localeCompare(b.folder, undefined, { numeric: true, sensitivity: "base" })
  );

  return chapters;
}
