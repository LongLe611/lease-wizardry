
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DiscountRateSectionProps {
  onRateChange: (rate: number) => void;
}

export function DiscountRateSection({ onRateChange }: DiscountRateSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="discount-rate">Discount Rate (%)</Label>
        <Input
          id="discount-rate"
          type="number"
          step="0.01"
          onChange={(e) => onRateChange(Number(e.target.value))}
          required
        />
      </div>
    </div>
  );
}
