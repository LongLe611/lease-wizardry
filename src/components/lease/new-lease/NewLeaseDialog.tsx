
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { NewLeaseFormContent } from "./NewLeaseFormContent";
import { useLeaseForm } from "./hooks/useLeaseForm";

export function NewLeaseDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    isLowValue, 
    setIsLowValue, 
    formData, 
    handleDateChange,
    handlePaymentTermsChange,
    handleDiscountRateChange,
    handleRateTableChange,
    handleContractFieldChange,
    handleSubmit,
    isSubmitting
  } = useLeaseForm(() => setIsOpen(false));

  const onSubmit = async () => {
    const success = await handleSubmit();
    if (success) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-gray-800 text-white">
          <Plus className="mr-2 h-4 w-4" />
          New Lease
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Lease Creation</DialogTitle>
        </DialogHeader>
        <NewLeaseFormContent
          isLowValue={isLowValue}
          formData={formData}
          onLowValueChange={setIsLowValue}
          onDateChange={handleDateChange}
          onPaymentTermsChange={handlePaymentTermsChange}
          onDiscountRateChange={handleDiscountRateChange}
          onRateTableChange={handleRateTableChange}
          onContractFieldChange={handleContractFieldChange}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
