
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lease } from "../summary/types";
import { NewLeaseFormContent } from "../new-lease/NewLeaseFormContent";

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
  const [isLowValue, setIsLowValue] = useState(false);
  const [formData, setFormData] = useState({
    contractNumber: '',
    lessorEntity: '',
    commencementDate: null as Date | null,
    expirationDate: null as Date | null,
    leaseTerm: null as number | null,
    paymentInterval: '',
    paymentType: '',
    basePayment: 0,
    cpiIndexRate: null as number | null,
    baseYear: null as number | null,
    discountRate: null as number | null,
    rateTableId: null as string | null,
    leaseTermBucket: null as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form data from lease when the component mounts or lease changes
  useEffect(() => {
    if (lease) {
      setFormData({
        contractNumber: lease.contract_number || '',
        lessorEntity: lease.lessor_entity,
        commencementDate: lease.commencement_date ? new Date(lease.commencement_date) : null,
        expirationDate: lease.expiration_date ? new Date(lease.expiration_date) : null,
        leaseTerm: lease.lease_term,
        paymentInterval: lease.payment_interval,
        paymentType: lease.payment_type || 'fixed',
        basePayment: lease.base_payment,
        cpiIndexRate: lease.cpi_index_rate,
        baseYear: lease.base_year,
        discountRate: lease.discount_rate,
        rateTableId: lease.rate_table_id,
        leaseTermBucket: null,
      });
      setIsLowValue(lease.is_low_value || false);
    }
  }, [lease]);

  const handleDateChange = (dates: { commencementDate: Date | null; expirationDate: Date | null; leaseTerm: number | null }) => {
    setFormData(prev => ({
      ...prev,
      ...dates
    }));
  };

  const handlePaymentTermsChange = (terms: {
    paymentInterval: string;
    paymentType: string;
    basePayment: number;
    cpiIndexRate: number | null;
    baseYear: number | null;
  }) => {
    setFormData(prev => ({
      ...prev,
      ...terms
    }));
  };

  const handleDiscountRateChange = (rate: number) => {
    setFormData(prev => ({
      ...prev,
      discountRate: rate
    }));
  };

  const handleRateTableChange = (tableId: string) => {
    setFormData(prev => ({
      ...prev,
      rateTableId: tableId
    }));
  };

  const handleContractFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!lease) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.commencementDate || !formData.expirationDate || !formData.discountRate || 
          !formData.paymentInterval || !formData.paymentType || !formData.basePayment ||
          !formData.contractNumber || !formData.lessorEntity) {
        throw new Error("Please fill in all required fields");
      }

      // Format dates and prepare data according to the database schema
      const leaseData = {
        contract_number: formData.contractNumber,
        lessor_entity: formData.lessorEntity,
        commencement_date: formData.commencementDate.toISOString().split('T')[0],
        expiration_date: formData.expirationDate.toISOString().split('T')[0],
        lease_term: formData.leaseTerm || 0,
        payment_interval: formData.paymentInterval as "monthly" | "quarterly" | "annual",
        payment_type: formData.paymentType as "fixed" | "variable",
        base_payment: formData.basePayment,
        cpi_index_rate: formData.cpiIndexRate,
        base_year: formData.baseYear,
        discount_rate: formData.discountRate,
        is_low_value: isLowValue,
        rate_table_id: formData.rateTableId,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('leases')
        .update(leaseData)
        .eq('id', lease.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Lease has been successfully updated",
      });
      
      onLeaseUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating lease:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update lease",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lease) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Existing Lease</DialogTitle>
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
          onSubmit={handleSubmit}
          submitLabel="Apply Changes"
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
