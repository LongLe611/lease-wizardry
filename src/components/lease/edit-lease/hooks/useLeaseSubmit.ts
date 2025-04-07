
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lease } from "../../summary/types";
import { EditLeaseFormData } from "../types";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "../../schedule/utils/formatters";

// Timeout duration in milliseconds (20 seconds)
const UPDATE_TIMEOUT = 20000;

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
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
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

  // Setup a timeout for the lease update operation
  const setupTimeout = () => {
    // Clear any existing timeout
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    
    // Set a new timeout
    const id = window.setTimeout(() => {
      // If we reach this point, the operation has timed out
      console.error("Lease update operation timed out after", UPDATE_TIMEOUT, "ms");
      
      // Abort any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Reset submission state
      setIsSubmitting(false);
      
      // Show timeout error to user
      toast({
        title: "Update Timed Out",
        description: "The lease update is taking too long. Please try again.",
        variant: "destructive",
      });
    }, UPDATE_TIMEOUT);
    
    setTimeoutId(id);
    return id;
  };

  // Clear the timeout
  const clearTimeout = () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      setTimeoutId(null);
    }
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
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      // Set up timeout
      setupTimeout();
      
      setIsSubmitting(true);
      console.log("Starting lease update for lease ID:", lease.id);
      console.log("Form data being submitted:", formData);
      
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
      console.log("Base payment amount being updated to:", formData.basePayment);

      // Set a shorter timeout for the Supabase API call
      const updatePromise = new Promise<any>(async (resolve, reject) => {
        try {
          // Improved Supabase update query with better error handling
          const { data, error: updateError } = await supabase
            .from('leases')
            .update(leaseData)
            .eq('id', lease.id)
            .select('*')
            .abortSignal(abortControllerRef.current?.signal);

          if (updateError) {
            console.error('Supabase update error:', updateError);
            reject(updateError);
            return;
          }

          // Check if data was returned from the update operation
          if (!data || data.length === 0) {
            console.warn('Update succeeded but no data was returned from update operation');
            
            try {
              console.log('Attempting fallback fetch to get updated lease data');
              const updatedData = await fetchLeaseById(lease.id);
              console.log('Fallback fetch successful:', updatedData);
              resolve(updatedData);
            } catch (fallbackError: any) {
              console.error('Fallback fetch failed:', fallbackError);
              reject(new Error(`Update succeeded but failed to retrieve updated data: ${fallbackError.message}`));
            }
          } else {
            console.log('Update returned data successfully:', data[0]);
            resolve(data[0]);
          }
        } catch (error: any) {
          // This will catch network errors and other exceptions
          console.error('Exception during update operation:', error);
          reject(error);
        }
      });

      // Wait for the update with a timeout
      const updatedData = await updatePromise;

      console.log('Lease updated successfully. Response:', updatedData);
      console.log('Updated fields include:', {
        basePayment: updatedData.base_payment,
        assetType: updatedData.asset_type,
        updatedAt: updatedData.updated_at
      });

      // Force invalidate and refetch ALL lease-related queries with stronger cache reset
      console.log('Completely invalidating and forcing refetch of ALL lease-related query cache');
      
      try {
        // First, reset the entire query cache
        await queryClient.resetQueries();
        
        // Specifically invalidate leases queries 
        await queryClient.invalidateQueries({ queryKey: ['leases'], refetchType: 'all' });
        
        // Force refetch of all leases data
        const refetchResult = await queryClient.refetchQueries({ 
          queryKey: ['leases'], 
          type: 'all', 
          exact: false 
        });
        
        console.log('Query cache reset and refetch completed:', refetchResult);
      } catch (cacheError: any) {
        console.error('Error refreshing cache (non-fatal):', cacheError);
        // We don't want to fail the operation if cache refresh fails
      }
      
      // Show a more specific success message
      toast({
        title: "Success",
        description: `Lease has been successfully updated with payment amount: ${formatCurrency(updatedData.base_payment)} ${updatedData.asset_type ? `and asset type: ${updatedData.asset_type}` : ''}`,
      });
      
      // Clear the timeout since we completed successfully
      clearTimeout();
      
      // Call the onSuccess callback to update parent components
      onSuccess();
      return true;
    } catch (error: any) {
      console.error('Error updating lease:', error);
      
      // If this was an AbortError, it was likely due to our own timeout
      if (error.name === 'AbortError') {
        toast({
          title: "Update Cancelled",
          description: "The lease update operation was cancelled. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update lease",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      // Always clear the timeout and reset state
      clearTimeout();
      setIsSubmitting(false);
      abortControllerRef.current = null;
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
}
