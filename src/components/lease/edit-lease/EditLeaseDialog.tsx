
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Lease } from "../summary/types";
import { NewLeaseFormContent } from "../new-lease/NewLeaseFormContent";
import { useEditLease } from "./hooks/useEditLease";
import { LeaseFormError } from "./components/LeaseFormError";
import { NoLeaseSelected } from "./components/NoLeaseSelected";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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
  const { toast } = useToast();
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const queryClient = useQueryClient();
  
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

  // Reset error and submit state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      clearError();
      setSubmitAttempted(false);
    } else if (isOpen && lease) {
      // Force refetch latest data when dialog opens
      queryClient.refetchQueries({ queryKey: ['leases'] });
      console.log("EditLeaseDialog opened with lease data:", {
        id: lease.id,
        basePayment: lease.base_payment,
        assetType: lease.asset_type
      });
    }
  }, [isOpen, clearError, lease, queryClient]);

  // Log lease data whenever it changes
  useEffect(() => {
    if (lease && isOpen) {
      console.log("Current lease data in EditLeaseDialog:", lease);
      console.log("Current form data in EditLeaseDialog:", formData);
    }
  }, [lease, isOpen, formData]);

  const onSubmit = async () => {
    console.log("Edit dialog submit button clicked");
    console.log("Current form data before submission:", formData);
    console.log("Editing lease with ID:", lease?.id);
    
    if (!lease) {
      console.error("No lease selected for editing");
      toast({
        title: "Error",
        description: "No lease selected for editing",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitAttempted(true);
    
    try {
      // Force invalidate cache before submitting to ensure we're working with fresh data
      await queryClient.invalidateQueries({ queryKey: ['leases'] });
      
      const success = await handleSubmit();
      console.log("Edit submit result:", success);
      
      if (success) {
        // Explicitly reset the query client cache completely
        await queryClient.resetQueries();
        await queryClient.refetchQueries({ queryKey: ['leases'], type: 'all' });
        
        // Double check cache invalidation
        console.log("Clearing all query cache after successful update");
        
        // Only close the dialog if the update was actually successful
        onOpenChange(false);
        
        // Call parent callback to ensure UI is refreshed
        onLeaseUpdated();
      }
    } catch (error: any) {
      console.error("Error in submit handler:", error);
      toast({
        title: "Error",
        description: `Failed to update lease: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
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
        
        {submitAttempted && isSubmitting && (
          <div className="mt-4 p-2 bg-blue-50 text-blue-700 rounded">
            Processing your changes... Please wait.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
