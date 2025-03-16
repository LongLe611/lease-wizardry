
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { Lease } from "../summary/types";
import { NewLeaseFormContent } from "../new-lease/NewLeaseFormContent";
import { useEditLease } from "./hooks/useEditLease";
import { LeaseFormError } from "./components/LeaseFormError";
import { NoLeaseSelected } from "./components/NoLeaseSelected";

interface EditLeaseDialogProps {
  lease: Lease | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLeaseUpdated: () => void;
}

export function EditLeaseDialog({
  lease,
  isOpen,
  onOpenChange,
  onLeaseUpdated
}: EditLeaseDialogProps) {
  const {
    isLowValue,
    setIsLowValue,
    formData,
    loadingError,
    isSubmitting,
    handleDateChange,
    handlePaymentTermsChange,
    handleDiscountRateChange,
    handleRateTableChange,
    handleContractFieldChange,
    handleAssetCategoryChange,
    handleSubmit,
    clearError
  } = useEditLease(lease, onLeaseUpdated);

  // Reset error when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      clearError();
    }
  }, [isOpen, clearError]);

  const onSubmit = async () => {
    const success = await handleSubmit();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Existing Lease</DialogTitle>
          <DialogDescription>
            Make changes to your lease details below.
          </DialogDescription>
        </DialogHeader>
        
        {loadingError ? (
          <LeaseFormError error={loadingError} />
        ) : lease ? (
          <NewLeaseFormContent 
            isLowValue={isLowValue}
            formData={formData}
            onLowValueChange={setIsLowValue}
            onDateChange={handleDateChange}
            onPaymentTermsChange={handlePaymentTermsChange}
            onDiscountRateChange={handleDiscountRateChange}
            onRateTableChange={handleRateTableChange}
            onContractFieldChange={handleContractFieldChange}
            onAssetCategoryChange={handleAssetCategoryChange}
            submitLabel="Apply Changes"
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        ) : (
          <NoLeaseSelected />
        )}
      </DialogContent>
    </Dialog>
  );
}
