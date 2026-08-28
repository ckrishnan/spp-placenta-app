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
        <div className="grid gap-6 py-4 text-sm text-foreground/90 max-h-[70vh] overflow-y-auto pr-2">
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
            <h3 className="font-bold">Alternative Singleton Reference</h3>
            <p className="text-xs">
              Users can choose an alternative singleton weight reference in the header section:
            </p>
            <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
              Boyd et al. (user-provided singleton reference data; gestational ages 22-42 weeks).
            </blockquote>
            <p className="text-xs mt-2">
              The selected reference is remembered on this device. Twin calculations always use Pinar et al. because Boyd et al. provides singleton data only.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">Standardized Reporting Template</h3>
            <p className="text-xs">
              This tool was developed from the following manuscript and the recommendations of its authors:
            </p>
            <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
              Standardized Placental Pathology Reporting: Improving Quality and Clinical Utility. Recommendations from the Society for Pediatric Pathology Placental Pathology Reporting Task Force.
            </blockquote>
            <div className="text-xs text-muted-foreground pt-1 space-y-1">
              <p className="font-semibold text-foreground">Authors &amp; affiliations</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sanjita Ravishankar, MD — Department of Pathology, University Hospitals Cleveland Medical Center and Case Western Reserve University School of Medicine, Cleveland, OH, USA</li>
                <li>Francois Cady, MD — CellNetix Pathology, Olympia, WA, USA</li>
                <li>Chrystalle Katte Carreon, MD — Department of Pathology, Boston Children&apos;s Hospital and Harvard Medical School, Boston, MA, USA</li>
                <li>Eumenia Castro, MD — Department of Pathology &amp; Laboratory Medicine, University of Wisconsin School of Medicine and Public Health, University of Wisconsin Hospital and Clinics</li>
                <li>Virginia E. Duncan, MD — Department of Pathology, University of Alabama at Birmingham, Birmingham, AL, USA</li>
                <li>Philip J. Katzman, MD — Department of Pathology and Laboratory Medicine, University of Rochester Medical Center, Rochester, NY, USA</li>
                <li>Drucilla Roberts, MD — Department of Pathology, Massachusetts General Hospital and Harvard Medical School, Boston, MA, USA</li>
                <li>Karen K. Mestan, MD — Department of Pediatrics, University of California San Diego, La Jolla, CA, USA</li>
                <li>Cynthia Gyamfi-Bannerman, MD — Department of Obstetrics, Gynecology, and Reproductive Sciences, Division of Maternal-Fetal Medicine, University of California San Diego, La Jolla, CA, USA</li>
                <li>Heather Florescue, MD — Department of Obstetrics and Gynecology, University of Rochester Medical Center, Rochester, NY, USA</li>
                <li>Lindsey Wimmer, DNP — Star Legacy Foundation</li>
                <li>Alicia Loehlein — Measure the Placenta</li>
                <li>Mana Parast, MD — Department of Pathology, Center for Perinatal Discovery, University of California San Diego, La Jolla, CA, USA</li>
              </ul>
              <p className="pt-2">
                <span className="font-semibold text-foreground">Correspondence:</span> Sanjita Ravishankar, MD, Department of Pathology, University Hospitals Cleveland Medical Center, Case Western Reserve University School of Medicine, 11100 Euclid Ave., Cleveland, OH 44106 — Sanjita.ravishankar@uhhospitals.org
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">Web App Design</h3>
            <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
              Web app design: Chandra Krishnan, MD — chandra.krishnan@gmail.com
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
