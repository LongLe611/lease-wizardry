
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
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

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
  const [processingTime, setProcessingTime] = useState(0);
  const [processingTimeoutId, setProcessingTimeoutId] = useState<number | null>(null);
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
      setProcessingTime(0);
      if (processingTimeoutId !== null) {
        window.clearInterval(processingTimeoutId);
        setProcessingTimeoutId(null);
      }
    } else if (isOpen && lease) {
      // Force refetch latest data when dialog opens
      queryClient.refetchQueries({ queryKey: ['leases'] });
      console.log("EditLeaseDialog opened with lease data:", {
        id: lease.id,
        basePayment: lease.base_payment,
        assetType: lease.asset_type
      });
    }

    return () => {
      // Cleanup
      if (processingTimeoutId !== null) {
        window.clearInterval(processingTimeoutId);
      }
    };
  }, [isOpen, clearError, lease, queryClient, processingTimeoutId]);

  // Log lease data whenever it changes
  useEffect(() => {
    if (lease && isOpen) {
      console.log("Current lease data in EditLeaseDialog:", lease);
      console.log("Current form data in EditLeaseDialog:", formData);
    }
  }, [lease, isOpen, formData]);

  // Processing timer for feedback
  useEffect(() => {
    if (isSubmitting && submitAttempted) {
      // Start a timer to update processing time
      const intervalId = window.setInterval(() => {
        setProcessingTime(prev => prev + 0.5);
      }, 500);
      
      setProcessingTimeoutId(intervalId);
      
      return () => {
        window.clearInterval(intervalId);
      };
    } else if (processingTimeoutId !== null) {
      window.clearInterval(processingTimeoutId);
      setProcessingTimeoutId(null);
    }
  }, [isSubmitting, submitAttempted]);

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
    setProcessingTime(0);
    
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

  // Determine if we should show the processing timeout warning
  const showTimeoutWarning = isSubmitting && processingTime > 10;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing the dialog while submitting to avoid UI state issues
      if (isSubmitting) {
        return;
      }
      onOpenChange(open);
    }}>
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
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-blue-50 text-blue-700 rounded">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold">Processing your changes... Please wait.</span>
                <span className="text-sm">({processingTime.toFixed(1)}s)</span>
              </div>
              <Progress value={Math.min(processingTime * 5, 100)} className="h-2 bg-blue-100" />
            </div>
            
            {showTimeoutWarning && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">This is taking longer than expected</p>
                  <p className="text-sm text-amber-700">
                    The update is still processing. You can continue waiting or close this dialog and try again.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
