
import { EditLeaseFormData } from "../types";

export function useEditLeaseHandlers(
  setFormData: (updater: (prev: EditLeaseFormData) => EditLeaseFormData) => void
) {
  const handleDateChange = (dates: { 
    commencementDate: Date | null; 
    expirationDate: Date | null; 
    leaseTerm: number | null 
  }) => {
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

  return {
    handleDateChange,
    handlePaymentTermsChange,
    handleDiscountRateChange,
    handleRateTableChange,
    handleContractFieldChange,
    handleAssetCategoryChange
  };
}
