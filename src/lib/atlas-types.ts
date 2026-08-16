// Shared types for the Picture Atlas. Safe to import from client and server code
// (types only — no Node.js APIs here).

export type AtlasImage = {
  id: string;
  fileName: string;
  imageUrl: string;
  description: string;
  imageHint: string;
};

export type AtlasChapter = {
  folder: string;
  title: string;
  images: AtlasImage[];
};
