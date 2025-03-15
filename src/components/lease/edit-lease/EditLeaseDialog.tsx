
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PencilLine } from "lucide-react";
import { ContractDetailsSection } from "../new-lease/sections/ContractDetailsSection";
import { PaymentTermsSection } from "../new-lease/sections/PaymentTermsSection";
import { AssetClassificationSection } from "../new-lease/sections/AssetClassificationSection";
import { DiscountRateSection } from "../new-lease/sections/DiscountRateSection";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lease } from "../summary/types";

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
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contract Details</h3>
            <ContractDetailsSection 
              isLowValue={isLowValue}
              onDateChange={handleDateChange}
              onFieldChange={handleContractFieldChange}
              contractNumber={formData.contractNumber}
              lessorEntity={formData.lessorEntity}
              initialCommencementDate={formData.commencementDate}
              initialExpirationDate={formData.expirationDate}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Terms</h3>
            <PaymentTermsSection 
              onPaymentTermsChange={handlePaymentTermsChange}
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
              onLowValueChange={setIsLowValue}
              initialIsLowValue={isLowValue}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Discount Rate</h3>
            <DiscountRateSection 
              onRateChange={handleDiscountRateChange}
              onRateTableChange={handleRateTableChange}
              leaseTerm={formData.leaseTerm}
              paymentInterval={formData.paymentInterval}
              initialDiscountRate={formData.discountRate}
              initialRateTableId={formData.rateTableId}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSubmit}
              className="bg-black hover:bg-gray-800 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Apply Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
