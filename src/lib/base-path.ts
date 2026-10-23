// `NEXT_PUBLIC_*` values are inlined at build time, so this is safe to import
// from both server and client components.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Prefix a root-absolute path (e.g. "/images/atlas/foo.jpg") with the
 * deployment base path so it resolves on GitHub Pages project sites.
 */
export function withBasePath(path: string): string {
  if (!basePath || !path.startsWith("/")) return path;
  return `${basePath}${path}`;
}
