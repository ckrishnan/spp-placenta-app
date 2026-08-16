"use client";

import { useState } from "react";
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
import { BookImage, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { compartments } from "@/lib/constants";
import { atlasData } from "@/lib/atlas";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";

const imageMap = new Map(PlaceHolderImages.map(img => [img.id, img]));

export function AtlasModal() {
  const [selectedImage, setSelectedImage] = useState<ImagePlaceholder | null>(null);
  const [isFullImageOpen, setIsFullImageOpen] = useState(false);
  const [categoryImages, setCategoryImages] = useState<ImagePlaceholder[]>([]);

  const handleOpenImage = (image: ImagePlaceholder, images: ImagePlaceholder[]) => {
    setSelectedImage(image);
    setCategoryImages(images);
    setIsFullImageOpen(true);
  };

  const navigate = (direction: 'next' | 'prev') => {
    if (!selectedImage || categoryImages.length === 0) return;
    const currentIndex = categoryImages.findIndex(img => img.id === selectedImage.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = categoryImages.length - 1;
    if (newIndex >= categoryImages.length) newIndex = 0;
    setSelectedImage(categoryImages[newIndex]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BookImage className="mr-2" />
          Picture Atlas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90svh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Reference Picture Atlas</DialogTitle>
          <DialogDescription>
            A visual guide to common histopathologic findings.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
        <Tabs defaultValue={compartments[0].id} className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            {compartments.map((compartment) => (
              <TabsTrigger key={compartment.id} value={compartment.id}>
                {compartment.name}
              </TabsTrigger>
            ))}
          </TabsList>
            <div className="flex-1 overflow-y-auto mt-4 pr-2">
              {compartments.map((compartment) => {
                const imagesIds = Object.entries(atlasData)
                    .filter(([key]) => key.startsWith(`${compartment.id}:`))
                    .flatMap(([_, ids]) => ids);
                
                const images = imagesIds
                    .map(id => imageMap.get(id))
                    .filter((img): img is ImagePlaceholder => !!img);

                return (
                <TabsContent key={compartment.id} value={compartment.id}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.length > 0 ? (
                      images.map((image, index) => (
                          <Card key={index}>
                              <CardHeader>
                                  <CardTitle className="text-base">{image.description}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                    <div 
                                      className="aspect-video relative overflow-hidden rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => handleOpenImage(image, images)}
                                    >
                                        <Image
                                          src={image.imageUrl}
                                          alt={image.description}
                                          fill
                                          className="object-cover"
                                          data-ai-hint={image.imageHint}
                                          sizes="(max-width: 640px) 100vw, 50vw"
                                        />
                                    </div>
                              </CardContent>
                          </Card>
                      ))
                    ) : (
                          <p className="text-center text-muted-foreground col-span-full py-8">No reference images available for this compartment.</p>
                    )}
                  </div>
                </TabsContent>
                )
              })}
            </div>
        </Tabs>
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
                        <Button variant="ghost" className="text-white" onClick={() => navigate('prev')}><ChevronLeft /></Button>
                        <Button variant="ghost" className="text-white" onClick={() => navigate('next')}><ChevronRight /></Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
