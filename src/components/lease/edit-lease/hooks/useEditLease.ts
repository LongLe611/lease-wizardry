
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lease } from "../../summary/types";

type EditLeaseFormData = {
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
  assetCategory: string | null;
};

export function useEditLease(lease: Lease | null, onSuccess: () => void) {
  const [isLowValue, setIsLowValue] = useState(false);
  const [formData, setFormData] = useState<EditLeaseFormData>({
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
    assetCategory: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize form data from lease
  useEffect(() => {
    if (lease) {
      console.log("Loading lease data for editing:", lease);
      try {
        setLoadingError(null);
        
        // Extract asset category from asset_type if available
        let assetCategory = null;
        if (lease.asset_type) {
          assetCategory = lease.asset_type;
        }
        
        // Make sure dates are properly converted
        const commencementDate = lease.commencement_date ? new Date(lease.commencement_date) : null;
        const expirationDate = lease.expiration_date ? new Date(lease.expiration_date) : null;
        
        // Set all form fields with proper type conversion
        setFormData({
          contractNumber: lease.contract_number || '',
          lessorEntity: lease.lessor_entity || '',
          commencementDate: commencementDate,
          expirationDate: expirationDate,
          leaseTerm: lease.lease_term || null,
          paymentInterval: lease.payment_interval || '',
          paymentType: lease.payment_type || 'fixed',
          basePayment: lease.base_payment || 0,
          cpiIndexRate: lease.cpi_index_rate || null,
          baseYear: lease.base_year || null,
          discountRate: lease.discount_rate || null,
          rateTableId: lease.rate_table_id || null,
          leaseTermBucket: null,
          assetCategory: assetCategory,
        });
        
        // Set is_low_value separately
        setIsLowValue(!!lease.is_low_value);
        
        console.log("Form data initialized:", {
          basePayment: lease.base_payment,
          paymentInterval: lease.payment_interval,
          assetType: lease.asset_type,
          discountRate: lease.discount_rate
        });
      } catch (error: any) {
        console.error("Error setting form data:", error);
        setLoadingError(error.message || "Failed to load lease data");
        toast({
          title: "Error",
          description: "Failed to load lease data: " + (error.message || "Unknown error"),
          variant: "destructive",
        });
      }
    }
  }, [lease, toast]);

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

  const handleAssetCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      assetCategory: category
    }));
  };

  const handleSubmit = async () => {
    if (!lease) {
      toast({
        title: "Error",
        description: "No lease selected for editing",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.commencementDate || !formData.expirationDate || !formData.discountRate || 
          !formData.paymentInterval || !formData.paymentType || 
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
        asset_type: formData.assetCategory,
        updated_at: new Date().toISOString()
      };

      console.log("Updating lease with data:", leaseData);

      const { error: updateError } = await supabase
        .from('leases')
        .update(leaseData)
        .eq('id', lease.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Lease has been successfully updated",
      });
      
      onSuccess();
      return true;
    } catch (error: any) {
      console.error('Error updating lease:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update lease",
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
    loadingError,
    isSubmitting,
    handleDateChange,
    handlePaymentTermsChange,
    handleDiscountRateChange,
    handleRateTableChange,
    handleContractFieldChange,
    handleAssetCategoryChange,
    handleSubmit,
    clearError: () => setLoadingError(null)
  };
}
