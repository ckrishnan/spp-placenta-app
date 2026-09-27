"use client";

import type { CSSProperties, DragEvent, MouseEvent } from "react";
import { cn } from "@/lib/utils";

// Repeating, subtle "© SPP" watermark rendered as a tiled inline-SVG background.
// This is a visual deterrent, not a hard copy-prevention mechanism: screenshots,
// devtools, and direct image URLs cannot be blocked from the browser.
//
// The text is drawn as white with a dark outline so it stays visible over both
// light histology images and dark backgrounds. The element is painted above the
// image it overlays (DOM order + positioning), so it sits on the image itself,
// not on the surrounding letterbox.
const WATERMARK_TEXT = "© SPP";

function buildWatermarkStyle(): CSSProperties {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="140" viewBox="0 0 220 140">',
    '<text x="110" y="70" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="600" letter-spacing="1" fill="rgba(255,255,255,0.65)" stroke="rgba(0,0,0,0.55)" stroke-width="1.2" paint-order="stroke" transform="rotate(-28 110 70)">',
    WATERMARK_TEXT,
    "</text></svg>",
  ].join("");

  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundRepeat: "repeat",
    backgroundSize: "220px 140px",
  };
}

/**
 * Overlay that tiles a subtle "© SPP" watermark over an image container.
 * Place it as a sibling of the image inside a `relative` container.
 */
export function WatermarkOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-10", className)}
      style={{ ...buildWatermarkStyle(), opacity: 0.5 }}
    />
  );
}

// Props to harden an <img> against casual copying: blocks the browser's
// right-click "Save image as..." menu and drag-to-desktop.
export const imageCopyGuards = {
  draggable: false,
  onContextMenu: (e: MouseEvent<HTMLImageElement>) => e.preventDefault(),
  onDragStart: (e: DragEvent<HTMLImageElement>) => e.preventDefault(),
} as const;
