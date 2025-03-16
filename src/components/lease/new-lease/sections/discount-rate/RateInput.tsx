
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

interface RateInputProps {
  discountRate: number | null;
  onRateChange: (value: number) => void;
  onRefresh: () => void;
  isRefreshDisabled: boolean;
}

export function RateInput({ 
  discountRate, 
  onRateChange, 
  onRefresh,
  isRefreshDisabled
}: RateInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Label htmlFor="discount-rate" className="mr-2">Discount Rate (%)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">About Discount Rates</h4>
              <p className="text-sm text-muted-foreground">
                This rate is used to calculate the present value of lease payments.
                It should reflect your incremental borrowing rate or the rate implicit in the lease.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center">
        <Input
          id="discount-rate"
          type="number"
          step="0.01"
          value={discountRate || ''}
          onChange={(e) => onRateChange(Number(e.target.value))}
          className="w-full"
          required
        />
        <Button 
          variant="outline" 
          size="icon" 
          className="ml-2"
          onClick={onRefresh}
          disabled={isRefreshDisabled}
        >
          ↻
        </Button>
      </div>
    </div>
  );
}
