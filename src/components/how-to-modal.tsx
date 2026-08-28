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
import { HelpCircle, Info } from "lucide-react";

export function HowToModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <HelpCircle className="mr-2" />
          How to Use
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">How to Use Placenta Pathfinder</DialogTitle>
          <DialogDescription>
            Follow these simple steps to generate your report.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm text-foreground/90">
          <div className="space-y-2">
            <h3 className="font-bold">1. Enter Case Information</h3>
            <p>
              Start by filling in the gestational age (weeks and days) and clinical context. 
              If this is a twin pregnancy, check the <strong>"Twin Pregnancy"</strong> box to enable separate data entry for Twin A and Twin B.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">2. Provide Placental Details</h3>
            <p>
              Enter the placental weight in grams. For twins, use the tabs to switch between twins. 
              The tool automatically calculates the estimated weight percentile based on published reference data.
              Use the <strong>"Weight Reference"</strong> selector in the header to choose between 
              <strong> Pinar et al.</strong> and <strong>Boyd et al.</strong>; your choice is remembered on this device.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">3. Select Pathologic Findings</h3>
            <p>
              Open each accordion section (Umbilical Cord, Membranes, etc.) and
              check the boxes for identified alterations. Findings are color-coded by 
              <strong>Injury Pattern</strong> (e.g., MVM, FVM, Acute Chorioamnionitis). 
              Hover over the info icon (<Info className="inline h-4 w-4" />) for descriptions and reference images.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">4. Generate and Review</h3>
            <p>
              Click <strong>"Generate Report"</strong> to create a standardized, plain-text summary. 
              Review the output for accuracy and use the copy button to transfer it to your reporting system.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
