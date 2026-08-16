"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookText } from "lucide-react";

export function ReferencesModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BookText className="mr-2" />
          References
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">References</DialogTitle>
          <DialogDescription>
            Key literature and data sources used in this tool.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 text-sm text-foreground/90">
          <div className="space-y-2">
            <h3 className="font-bold">Placental Weight Percentiles</h3>
            <p className="text-xs">
              The reference data for placental weights is derived from:
            </p>
            <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
              Pinar H. et al. Pediatr Pathol Lab med 1996; 16:901-7.
            </blockquote>
             <p className="text-xs mt-2">
              Additional singleton data was supplemented based on user-provided institutional data.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">Standardized Reporting Template</h3>
            <p className="text-xs">
              The reporting structure and diagnostic categories are based on the recommendations from the Society for Pediatric Pathology (SPP) Placental Pathology Reporting Task Force:
            </p>
            <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
              Ravishankar S, et al. Standardized Placental Pathology Reporting: Improving Quality and Clinical Utility. Society for Pediatric Pathology Placental Pathology Reporting Task Force. 2024.
            </blockquote>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">Placental Lesion Definitions</h3>
            <p className="text-xs">
              The definitions and classification of placental lesions are based on the consensus guidelines from the Amsterdam Placental Workshop Group:
            </p>
            <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
              Khong TY, et al. Sampling and definitions of placental lesions: Amsterdam Placental Workshop Group Consensus Statement. Arch Pathol Lab Med. 2016;140(7):698-713. (PMID: 27077851)
            </blockquote>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
