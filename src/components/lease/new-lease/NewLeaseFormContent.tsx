
import { ContractDetailsSection } from "./sections/ContractDetailsSection";
import { PaymentTermsSection } from "./sections/PaymentTermsSection";
import { AssetClassificationSection } from "./sections/AssetClassificationSection";
import { DiscountRateSection } from "./sections/DiscountRateSection";
import { Button } from "@/components/ui/button";
import { LeaseFormData } from "./hooks/useLeaseForm";

interface NewLeaseFormContentProps {
  isLowValue: boolean;
  formData: LeaseFormData;
  onLowValueChange: (value: boolean) => void;
  onDateChange: (dates: { commencementDate: Date | null; expirationDate: Date | null; leaseTerm: number | null }) => void;
  onPaymentTermsChange: (terms: {
    paymentInterval: string;
    paymentType: string;
    basePayment: number;
    cpiIndexRate: number | null;
    baseYear: number | null;
  }) => void;
  onDiscountRateChange: (rate: number) => void;
  onRateTableChange: (tableId: string) => void;
  onContractFieldChange: (field: string, value: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function NewLeaseFormContent({
  isLowValue,
  formData,
  onLowValueChange,
  onDateChange,
  onPaymentTermsChange,
  onDiscountRateChange,
  onRateTableChange,
  onContractFieldChange,
  onSubmit,
  submitLabel = "Add Lease",
  isSubmitting = false
}: NewLeaseFormContentProps) {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contract Details</h3>
        <ContractDetailsSection 
          isLowValue={isLowValue}
          onDateChange={onDateChange}
          onFieldChange={onContractFieldChange}
          contractNumber={formData.contractNumber}
          lessorEntity={formData.lessorEntity}
          initialCommencementDate={formData.commencementDate}
          initialExpirationDate={formData.expirationDate}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Terms</h3>
        <PaymentTermsSection 
          onPaymentTermsChange={onPaymentTermsChange}
          initialPaymentInterval={formData.paymentInterval}
          initialPaymentType={formData.paymentType}
          initialBasePayment={formData.basePayment}
          initialCpiIndexRate={formData.cpiIndexRate}
          initialBaseYear={formData.baseYear}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Asset Classification</h3>
        <AssetClassificationSection 
          onLowValueChange={onLowValueChange}
          initialIsLowValue={isLowValue}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Discount Rate</h3>
        <DiscountRateSection 
          onRateChange={onDiscountRateChange}
          onRateTableChange={onRateTableChange}
          leaseTerm={formData.leaseTerm}
          paymentInterval={formData.paymentInterval}
          initialDiscountRate={formData.discountRate}
          initialRateTableId={formData.rateTableId}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={onSubmit}
          className="bg-black hover:bg-gray-800 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
