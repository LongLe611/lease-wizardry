
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lease } from "../../summary/types";
import { EditLeaseFormData } from "../types";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "../../schedule/utils/formatters";

// Function to fetch a single lease by ID as a fallback
export const fetchLeaseById = async (leaseId: string) => {
  console.log("Fetching single lease as fallback for ID:", leaseId);
  try {
    const { data, error } = await supabase
      .from('leases')
      .select('*')
      .eq('id', leaseId)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error("No lease data found for ID: " + leaseId);
    
    console.log("Fallback fetch successful:", data);
    return data;
  } catch (error: any) {
    console.error("Error in fallback fetch:", error);
    throw error;
  }
};

export function useLeaseSubmit(
  lease: Lease | null, 
  formData: EditLeaseFormData,
  isLowValue: boolean,
  onSuccess: () => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateFormData = (formData: EditLeaseFormData): string | null => {
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
      
      return `Please fill in all required fields: ${missingFields.join(", ")}`;
    }
    return null;
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
      const validationError = validateFormData(formData);
      if (validationError) {
        throw new Error(validationError);
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

      // Improved Supabase update query with better error handling
      let updatedData;
      const { data, error: updateError } = await supabase
        .from('leases')
        .update(leaseData)
        .eq('id', lease.id)
        .select();  // Explicitly select all columns

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      // Check if data was returned from the update operation
      if (!data || data.length === 0) {
        console.warn('Update succeeded but no data was returned from update operation');
        
        // Implement fallback fetch if the update doesn't return data
        try {
          console.log('Attempting fallback fetch to get updated lease data');
          updatedData = await fetchLeaseById(lease.id);
          console.log('Fallback fetch successful:', updatedData);
        } catch (fallbackError: any) {
          console.error('Fallback fetch failed:', fallbackError);
          throw new Error(`Update succeeded but failed to retrieve updated data: ${fallbackError.message}`);
        }
      } else {
        updatedData = data[0];
        console.log('Update returned data successfully:', updatedData);
      }

      // Ensure we have valid data to work with
      if (!updatedData) {
        throw new Error('Failed to retrieve updated lease data after successful update');
      }

      console.log('Lease updated successfully. Response:', updatedData);
      console.log('Updated fields include:', {
        basePayment: updatedData.base_payment,
        assetType: updatedData.asset_type,
        updatedAt: updatedData.updated_at
      });

      // Force invalidate and refetch all lease-related queries
      console.log('Invalidating and refetching leases query cache');
      await queryClient.invalidateQueries({ queryKey: ['leases'] });
      const refetchResult = await queryClient.refetchQueries({ queryKey: ['leases'] });
      console.log('Refetch completed:', refetchResult);
      
      // Show a more specific success message
      toast({
        title: "Success",
        description: `Lease has been successfully updated with payment amount: ${formatCurrency(updatedData.base_payment)} ${updatedData.asset_type ? `and asset type: ${updatedData.asset_type}` : ''}`,
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
    isSubmitting,
    handleSubmit
  };
}
