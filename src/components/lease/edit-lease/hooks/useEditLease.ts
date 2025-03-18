
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lease } from "../../summary/types";
import { EditLeaseFormData } from "../types";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

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
    console.log("Date fields updated:", dates);
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
    console.log("Payment terms updated:", terms);
  };

  const handleDiscountRateChange = (rate: number) => {
    setFormData(prev => ({
      ...prev,
      discountRate: rate
    }));
    console.log("Discount rate updated:", rate);
  };

  const handleRateTableChange = (tableId: string) => {
    setFormData(prev => ({
      ...prev,
      rateTableId: tableId
    }));
    console.log("Rate table updated:", tableId);
  };

  const handleContractFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    console.log(`Contract field "${field}" updated:`, value);
  };

  const handleAssetCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      assetCategory: category
    }));
    console.log("Asset category updated:", category);
  };

  const handleSubmit = async () => {
    console.log("Edit lease submit handler triggered");
    
    if (!lease) {
      console.error("Submit called but no lease is selected");
      toast({
        title: "Error",
        description: "No lease selected for editing",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Starting lease update for lease ID:", lease.id);
      
      // Validate required fields
      if (!formData.commencementDate || !formData.expirationDate || !formData.discountRate || 
          !formData.paymentInterval || !formData.paymentType || 
          !formData.contractNumber || !formData.lessorEntity) {
        const missingFields = [];
        if (!formData.commencementDate) missingFields.push("Commencement Date");
        if (!formData.expirationDate) missingFields.push("Expiration Date");
        if (!formData.discountRate) missingFields.push("Discount Rate");
        if (!formData.paymentInterval) missingFields.push("Payment Interval");
        if (!formData.paymentType) missingFields.push("Payment Type");
        if (!formData.contractNumber) missingFields.push("Contract Number");
        if (!formData.lessorEntity) missingFields.push("Lessor Entity");
        
        const errorMsg = `Please fill in all required fields: ${missingFields.join(", ")}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
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
      console.log("Target lease ID:", lease.id);

      // Perform the update with better error handling
      const { data, error: updateError } = await supabase
        .from('leases')
        .update(leaseData)
        .eq('id', lease.id)
        .select();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      if (!data || data.length === 0) {
        console.error('Update succeeded but no data was returned');
        throw new Error('Update succeeded but no data was returned');
      }

      console.log('Lease updated successfully. Response:', data);
      console.log('Updated fields include:', {
        basePayment: data[0].base_payment,
        assetType: data[0].asset_type,
        updatedAt: data[0].updated_at
      });

      // Force invalidate all queries to refresh data across all components
      console.log('Invalidating leases query cache');
      await queryClient.invalidateQueries({ queryKey: ['leases'] });
      await queryClient.refetchQueries({ queryKey: ['leases'] });
      
      toast({
        title: "Success",
        description: `Lease has been successfully updated with payment amount: ${data[0].base_payment} and asset type: ${data[0].asset_type || 'None'}`,
      });
      
      // Call the onSuccess callback to update parent components
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
