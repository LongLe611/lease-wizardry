
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Lease } from "../../summary/types";
import { EditLeaseFormData } from "../types";

export function useEditLeaseForm(lease: Lease | null) {
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

  return {
    formData,
    setFormData,
    isLowValue,
    setIsLowValue,
    loadingError,
    clearError: () => setLoadingError(null)
  };
}
