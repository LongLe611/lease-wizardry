
import { Lease } from "../../summary/types";
import { useEditLeaseForm } from "./useEditLeaseForm";
import { useEditLeaseHandlers } from "./useEditLeaseHandlers";
import { useLeaseSubmit } from "./useLeaseSubmit";

export function useEditLease(lease: Lease | null, onSuccess: () => void) {
  const {
    formData,
    setFormData,
    isLowValue,
    setIsLowValue,
    loadingError,
    clearError
  } = useEditLeaseForm(lease);

  const {
    handleDateChange,
    handlePaymentTermsChange,
    handleDiscountRateChange,
    handleRateTableChange,
    handleContractFieldChange,
    handleAssetCategoryChange
  } = useEditLeaseHandlers(setFormData);

  const {
    isSubmitting,
    handleSubmit
  } = useLeaseSubmit(lease, formData, isLowValue, onSuccess);

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
    clearError
  };
}
