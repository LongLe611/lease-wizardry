
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function PaymentTermsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="payment-type">Variable Payments</Label>
        <Switch id="payment-type" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpi-index">CPI/Index Rate</Label>
        <Input
          id="cpi-index"
          type="number"
          step="0.01"
          placeholder="Auto-populated rate..."
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="residual-value">Residual Value Guarantee</Label>
        <Input
          id="residual-value"
          type="number"
          step="0.01"
          placeholder="Enter guaranteed amount..."
          className="w-full"
        />
      </div>
    </div>
  );
}
