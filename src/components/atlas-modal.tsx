"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
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
import { BookImage, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
            A visual guide to histopathologic findings, organized by image type. Each chapter
            corresponds to a folder under <code>public/images/atlas/</code>.
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

      <Dialog open={isFullImageOpen} onOpenChange={setIsFullImageOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden border-none bg-black/90">
          <DialogTitle className="sr-only">Full Image View</DialogTitle>
          {selectedImage && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <div className="text-white text-lg mb-2 font-medium">{selectedImage.description}</div>
              <div className="relative aspect-video w-full flex-1">
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.description}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex gap-4 mt-4">
                <Button variant="ghost" className="text-white" onClick={() => navigate("prev")}>
                  <ChevronLeft />
                </Button>
                <Button variant="ghost" className="text-white" onClick={() => navigate("next")}>
                  <ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
