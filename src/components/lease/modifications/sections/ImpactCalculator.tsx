
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export function ImpactCalculator() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="original-liability">Original Liability</Label>
          <Input
            id="original-liability"
            type="number"
            step="0.01"
            placeholder="Current value..."
            className="w-full"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="modified-liability">Modified Liability</Label>
          <Input
            id="modified-liability"
            type="number"
            step="0.01"
            placeholder="New value..."
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="discount-rate">Applicable Discount Rate (%)</Label>
        <div className="relative">
          <Input
            id="discount-rate"
            type="number"
            step="0.01"
            placeholder="Auto-adjusted rate..."
            className="w-full"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
          >
            <Calculator className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
