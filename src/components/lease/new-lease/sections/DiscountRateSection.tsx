
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export function DiscountRateSection() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="borrowing-rate">Incremental Borrowing Rate (%)</Label>
        <div className="relative">
          <Input
            id="borrowing-rate"
            type="number"
            step="0.01"
            placeholder="Calculate rate..."
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

      <div className="space-y-2">
        <Label htmlFor="implicit-rate">Implicit Rate (%)</Label>
        <Input
          id="implicit-rate"
          type="number"
          step="0.01"
          placeholder="Helper calculated rate..."
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="central-bank-rate">Central Bank Reference Rate (%)</Label>
        <Input
          id="central-bank-rate"
          type="number"
          step="0.01"
          placeholder="Auto-populated rate..."
          className="w-full"
          readOnly
        />
      </div>
    </div>
  );
}
