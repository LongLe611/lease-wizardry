
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentTermsProps {
  onPaymentTermsChange: (terms: {
    paymentInterval: string;
    paymentType: string;
    basePayment: number;
    cpiIndexRate: number | null;
    baseYear: number | null;
  }) => void;
  initialPaymentInterval?: string;
  initialPaymentType?: string;
  initialBasePayment?: number;
  initialCpiIndexRate?: number | null;
  initialBaseYear?: number | null;
}

export function PaymentTermsSection({ 
  onPaymentTermsChange,
  initialPaymentInterval = 'monthly',
  initialPaymentType = 'fixed',
  initialBasePayment = 0,
  initialCpiIndexRate = null,
  initialBaseYear = null
}: PaymentTermsProps) {
  const [isVariable, setIsVariable] = useState(initialPaymentType === 'variable');
  const [paymentInterval, setPaymentInterval] = useState<string>(initialPaymentInterval);
  const [basePayment, setBasePayment] = useState<number>(initialBasePayment);
  const [cpiIndexRate, setCpiIndexRate] = useState<number | null>(initialCpiIndexRate);
  const [baseYear, setBaseYear] = useState<number | null>(initialBaseYear);
  const [calculatedPayment, setCalculatedPayment] = useState<number | null>(null);

  // Initialize with initial values
  useEffect(() => {
    setIsVariable(initialPaymentType === 'variable');
    setPaymentInterval(initialPaymentInterval);
    setBasePayment(initialBasePayment);
    setCpiIndexRate(initialCpiIndexRate);
    setBaseYear(initialBaseYear);
  }, [initialPaymentType, initialPaymentInterval, initialBasePayment, initialCpiIndexRate, initialBaseYear]);

  useEffect(() => {
    if (isVariable && basePayment && cpiIndexRate && baseYear) {
      const currentYear = new Date().getFullYear();
      const yearDiff = currentYear - baseYear;
      const calculated = basePayment * Math.pow(1 + (cpiIndexRate / 100), yearDiff);
      setCalculatedPayment(Number(calculated.toFixed(2)));
    } else {
      setCalculatedPayment(null);
    }

    onPaymentTermsChange({
      paymentInterval,
      paymentType: isVariable ? 'variable' : 'fixed',
      basePayment,
      cpiIndexRate,
      baseYear,
    });
  }, [isVariable, basePayment, cpiIndexRate, baseYear, paymentInterval, onPaymentTermsChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="payment-type">Variable Payments</Label>
        <Switch 
          id="payment-type"
          checked={isVariable}
          onCheckedChange={setIsVariable}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-interval">Payment Interval</Label>
        <Select value={paymentInterval} onValueChange={setPaymentInterval}>
          <SelectTrigger>
            <SelectValue placeholder="Select interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="base-payment">Base Payment Amount</Label>
        <Input
          id="base-payment"
          type="number"
          step="0.01"
          value={basePayment || ''}
          onChange={(e) => setBasePayment(Number(e.target.value))}
          className="w-full"
          required
        />
      </div>

      {isVariable && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="cpi-index">CPI/Index Rate (%)</Label>
              <Input
                id="cpi-index"
                type="number"
                step="0.01"
                value={cpiIndexRate || ''}
                onChange={(e) => setCpiIndexRate(Number(e.target.value))}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-year">Base Year</Label>
              <Input
                id="base-year"
                type="number"
                value={baseYear || ''}
                onChange={(e) => setBaseYear(Number(e.target.value))}
                className="w-full"
                required
              />
            </div>

            {calculatedPayment && (
              <div className="space-y-2">
                <Label htmlFor="calculated-payment">Calculated Payment</Label>
                <Input
                  id="calculated-payment"
                  type="number"
                  value={calculatedPayment}
                  className="w-full bg-gray-50"
                  readOnly
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
