"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BookImage,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { AtlasChapter, AtlasImage } from "@/lib/atlas-types";

export function AtlasModal() {
  const [open, setOpen] = useState(false);
  const [chapters, setChapters] = useState<AtlasChapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<string>();
  const [selectedImage, setSelectedImage] = useState<AtlasImage | null>(null);
  const [isFullImageOpen, setIsFullImageOpen] = useState(false);
  const [categoryImages, setCategoryImages] = useState<AtlasImage[]>([]);

  // Refetch on every open so a newly added folder/image shows up immediately.
  const loadChapters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/atlas");
      if (!res.ok) throw new Error(`Failed to load atlas (${res.status})`);
      const data = await res.json();
      setChapters(data.chapters ?? []);
    } catch (err) {
      console.error("Failed to load atlas chapters", err);
      setError("Could not load the picture atlas.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fall back to the first chapter if the active one is missing.
  const currentChapter =
    activeChapter && chapters.some((c) => c.folder === activeChapter)
      ? activeChapter
      : chapters[0]?.folder;

  const handleOpenImage = (image: AtlasImage, images: AtlasImage[]) => {
    setSelectedImage(image);
    setCategoryImages(images);
    setIsFullImageOpen(true);
  };

  const navigate = (direction: "next" | "prev") => {
    if (!selectedImage || categoryImages.length === 0) return;
    const currentIndex = categoryImages.findIndex((img) => img.id === selectedImage.id);
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = categoryImages.length - 1;
    if (newIndex >= categoryImages.length) newIndex = 0;
    setSelectedImage(categoryImages[newIndex]);
  };

  const currentImageIndex = selectedImage
    ? Math.max(0, categoryImages.findIndex((img) => img.id === selectedImage.id))
    : 0;

  // ---- Full-image zoom & pan ----
  const MIN_SCALE = 1;
  const MAX_SCALE = 6;
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const zoomRef = useRef<HTMLDivElement | null>(null);

  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Reset zoom whenever a new image is shown.
  useEffect(() => {
    resetZoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage?.id]);

  // Native wheel listener (non-passive so we can preventDefault page scroll).
  useEffect(() => {
    const el = zoomRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const px = e.clientX - cx;
      const py = e.clientY - cy;
      const curScale = scaleRef.current;
      const curOffset = offsetRef.current;
      const factor = e.deltaY < 0 ? 1.25 : 0.8;
      const next = clamp(curScale * factor, MIN_SCALE, MAX_SCALE);
      if (next === 1) {
        setScale(1);
        setOffset({ x: 0, y: 0 });
        return;
      }
      const wx = (px - curOffset.x) / curScale;
      const wy = (py - curOffset.y) / curScale;
      setScale(next);
      setOffset({ x: px - wx * next, y: py - wy * next });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isFullImageOpen, selectedImage?.id]);

  const zoomBy = (factor: number) => {
    const next = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
    if (next === 1) {
      resetZoom();
      return;
    }
    const k = next / scale;
    setScale(next);
    setOffset((o) => ({ x: o.x * k, y: o.y * k }));
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging({
      startX: e.clientX,
      startY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    });
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const el = zoomRef.current;
    let nx = dragging.offsetX + (e.clientX - dragging.startX);
    let ny = dragging.offsetY + (e.clientY - dragging.startY);
    if (el) {
      const r = el.getBoundingClientRect();
      const maxX = (r.width * (scale - 1)) / 2;
      const maxY = (r.height * (scale - 1)) / 2;
      nx = clamp(nx, -maxX, maxX);
      ny = clamp(ny, -maxY, maxY);
    }
    setOffset({ x: nx, y: ny });
  };

  const handlePointerUp = () => setDragging(null);

  const handleDoubleClick = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
      setOffset({ x: 0, y: 0 });
    }
  };

  const showSpinner = loading && chapters.length === 0;
  const showEmpty = !loading && !error && chapters.length === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) loadChapters();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <BookImage className="mr-2" />
          Picture Atlas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[90svh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-headline text-2xl">Reference Picture Atlas</DialogTitle>
          <DialogDescription>
            A visual guide to histopathologic findings, organized by image type.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
          {showSpinner ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : showEmpty ? (
            <p className="text-center text-muted-foreground py-16">
              No atlas images found. Add folders under <code>public/images/atlas/</code> and the
              chapters will appear here automatically.
            </p>
          ) : error && chapters.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">{error}</p>
          ) : (
            <Tabs
              value={currentChapter}
              onValueChange={setActiveChapter}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TabsList className="flex w-full flex-wrap h-auto shrink-0">
                {chapters.map((chapter) => (
                  <TabsTrigger key={chapter.folder} value={chapter.folder}>
                    {chapter.title} ({chapter.images.length})
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="min-h-0 flex-1 overflow-y-auto mt-4 pr-2">
                {chapters.map((chapter) => (
                  <TabsContent key={chapter.folder} value={chapter.folder}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {chapter.images.map((image) => (
                        <Card key={image.id}>
                          <CardHeader>
                            <CardTitle className="text-base">{image.description}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div
                              className="aspect-video relative overflow-hidden rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => handleOpenImage(image, chapter.images)}
                            >
                              <Image
                                src={image.imageUrl}
                                alt={image.description}
                                fill
                                className="object-cover"
                                data-ai-hint={image.imageHint || undefined}
                                sizes="(max-width: 640px) 100vw, 50vw"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>

      <Dialog
        open={isFullImageOpen}
        onOpenChange={(nextOpen) => {
          setIsFullImageOpen(nextOpen);
          if (!nextOpen) resetZoom();
        }}
      >
        <DialogContent
          hideCloseButton
          className="max-w-[96vw] max-h-[94svh] w-full p-0 overflow-hidden border-none bg-black/90"
        >
          <DialogTitle className="sr-only">Full Image View</DialogTitle>
          {selectedImage && (
            <div className="flex h-[94svh] max-h-[94svh] w-full flex-col">
              {/* Top bar: description + zoom controls + close */}
              <div className="flex items-center justify-between gap-3 p-3 pr-2 text-white">
                <div className="min-w-0">
                  <div className="truncate text-base font-medium">
                    {selectedImage.description}
                  </div>
                  <div className="truncate text-xs text-white/60">
                    {selectedImage.fileName}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white"
                      onClick={() => zoomBy(0.8)}
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-xs tabular-nums">
                      {Math.round(scale * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white"
                      onClick={() => zoomBy(1.25)}
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white"
                      onClick={resetZoom}
                      aria-label="Reset zoom"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Close viewer"
                      className="h-9 w-9 shrink-0 rounded-full bg-white/15 text-white hover:bg-white/30 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </DialogClose>
                </div>
              </div>

              {/* Zoomable / pannable image area */}
              <div
                ref={zoomRef}
                className="relative min-h-0 flex-1 overflow-hidden touch-none select-none"
                style={{
                  cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onDoubleClick={handleDoubleClick}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  }}
                >
                  <Image
                    src={selectedImage.imageUrl}
                    alt={selectedImage.description}
                    fill
                    draggable={false}
                    className="object-contain"
                    sizes="96vw"
                  />
                </div>
              </div>

              {/* Bottom bar: hint + prev/next */}
              <div className="flex items-center justify-between gap-4 p-3 text-white">
                <span className="hidden text-xs text-white/60 sm:inline">
                  Scroll to zoom · drag to pan · double-click to reset
                </span>
                <span className="text-xs text-white/60 sm:hidden">Zoom / pan enabled</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="text-white" onClick={() => navigate("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Prev</span>
                  </Button>
                  <span className="min-w-[3ch] text-center text-xs tabular-nums text-white/60">
                    {currentImageIndex + 1}/{categoryImages.length}
                  </span>
                  <Button variant="ghost" className="text-white" onClick={() => navigate("next")}>
                    <span className="mr-1 hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
