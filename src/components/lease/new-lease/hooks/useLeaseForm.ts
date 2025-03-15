
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type LeaseFormData = {
  contractNumber: string;
  lessorEntity: string;
  commencementDate: Date | null;
  expirationDate: Date | null;
  leaseTerm: number | null;
  paymentInterval: string;
  paymentType: string;
  basePayment: number;
  cpiIndexRate: number | null;
  baseYear: number | null;
  discountRate: number | null;
  rateTableId: string | null;
  leaseTermBucket: string | null;
};

export function useLeaseForm(onSuccess?: () => void) {
  const [isLowValue, setIsLowValue] = useState(false);
  const [formData, setFormData] = useState<LeaseFormData>({
    contractNumber: '',
    lessorEntity: '',
    commencementDate: null,
    expirationDate: null,
    leaseTerm: null,
    paymentInterval: '',
    paymentType: '',
    basePayment: 0,
    cpiIndexRate: null,
    baseYear: null,
    discountRate: null,
    rateTableId: null,
    leaseTermBucket: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.commencementDate || !formData.expirationDate || !formData.discountRate || 
          !formData.paymentInterval || !formData.paymentType || !formData.basePayment ||
          !formData.contractNumber || !formData.lessorEntity || !formData.rateTableId) {
        throw new Error("Please fill in all required fields");
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

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
        user_id: userData.user.id,
        rate_table_id: formData.rateTableId
      };

      const { error: insertError } = await supabase
        .from('leases')
        .insert(leaseData);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Lease has been successfully created",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error: any) {
      console.error('Error creating lease:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create lease",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
