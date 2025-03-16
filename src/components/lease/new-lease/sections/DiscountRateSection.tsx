
import { useDiscountRateSelector } from "@/hooks/useDiscountRateSelector";
import { RateTableSelector } from "./discount-rate/RateTableSelector";
import { RateInput } from "./discount-rate/RateInput";

interface DiscountRateSectionProps {
  onRateChange: (rate: number) => void;
  onRateTableChange: (tableId: string) => void;
  leaseTerm: number | null;
  paymentInterval: string;
  initialDiscountRate?: number | null;
  initialRateTableId?: string | null;
}

export function DiscountRateSection({ 
  onRateChange, 
  onRateTableChange,
  leaseTerm,
  paymentInterval,
  initialDiscountRate = null,
  initialRateTableId = null
}: DiscountRateSectionProps) {
  const {
    discountRate,
    selectedTableId,
    rateTables,
    isLoadingTables,
    handleRateTableChange,
    handleManualRateChange,
    refreshRate
  } = useDiscountRateSelector({
    leaseTerm,
    paymentInterval,
    initialDiscountRate,
    initialRateTableId,
    onRateChange,
    onRateTableChange
  });

  return (
    <div className="space-y-4">
      <RateTableSelector
        selectedTableId={selectedTableId}
        rateTables={rateTables}
        isLoading={isLoadingTables}
        onTableChange={handleRateTableChange}
      />

      <RateInput
        discountRate={discountRate}
        onRateChange={handleManualRateChange}
        onRefresh={refreshRate}
        isRefreshDisabled={!selectedTableId || !leaseTerm}
      />
      
      <p className="text-xs text-muted-foreground">
        {selectedTableId ? 
          "Rate automatically selected based on lease term and payment frequency" : 
          "Select a rate table to automatically set rate based on lease term"}
      </p>
    </div>
  );
}
