
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContractDetailsProps {
  isLowValue: boolean;
  onDateChange: (dates: { commencementDate: Date | null; expirationDate: Date | null; leaseTerm: number | null }) => void;
  onFieldChange?: (field: string, value: string) => void;
  contractNumber?: string;
  lessorEntity?: string;
}

export function ContractDetailsSection({ 
  isLowValue, 
  onDateChange, 
  onFieldChange,
  contractNumber = '',
  lessorEntity = ''
}: ContractDetailsProps) {
  const [commencementDate, setCommencementDate] = useState<Date | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [leaseTerm, setLeaseTerm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (commencementDate && expirationDate) {
      if (expirationDate <= commencementDate) {
        setError("Expiration date must be after commencement date");
        setLeaseTerm(null);
        return;
      }

      const diffTime = expirationDate.getTime() - commencementDate.getTime();
      const calculatedYears = Math.round((diffTime / (1000 * 3600 * 24 * 365)) * 100) / 100;
      setLeaseTerm(calculatedYears);

      if (calculatedYears < 1 && !isLowValue) {
        setWarning("Term is less than 1 year. Consider checking low-value exemption.");
      } else if (calculatedYears >= 1) {
        setWarning(null);
      }

      onDateChange({ commencementDate, expirationDate, leaseTerm: calculatedYears });
      setError(null);
    }
  }, [commencementDate, expirationDate, isLowValue, onDateChange]);

  const handleDateChange = (dateType: 'commencement' | 'expiration', value: string) => {
    const date = value ? new Date(value) : null;
    if (dateType === 'commencement') {
      setCommencementDate(date);
    } else {
      setExpirationDate(date);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (onFieldChange) {
      onFieldChange(field, value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contract-number">Contract Number</Label>
        <Input
          id="contract-number"
          placeholder="Enter contract number"
          value={contractNumber}
          onChange={(e) => handleInputChange('contractNumber', e.target.value)}
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lessor">Lessor Legal Entity</Label>
        <Input
          id="lessor"
          placeholder="Enter lessor legal entity name"
          value={lessorEntity}
          onChange={(e) => handleInputChange('lessorEntity', e.target.value)}
          className="w-full"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="commencement">Commencement Date</Label>
          <div className="relative">
            <Input
              id="commencement"
              type="date"
              className="w-full"
              onChange={(e) => handleDateChange('commencement', e.target.value)}
              required
            />
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiration">Expiration Date</Label>
          <div className="relative">
            <Input
              id="expiration"
              type="date"
              className="w-full"
              onChange={(e) => handleDateChange('expiration', e.target.value)}
              required
            />
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {warning && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="term">Lease Term (Years)</Label>
        <Input
          id="term"
          type="number"
          value={leaseTerm || ''}
          className="w-full"
          readOnly
        />
      </div>
    </div>
  );
}
