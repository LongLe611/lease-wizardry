
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ContractDetailsSection } from "./sections/ContractDetailsSection";
import { PaymentTermsSection } from "./sections/PaymentTermsSection";
import { AssetClassificationSection } from "./sections/AssetClassificationSection";
import { DiscountRateSection } from "./sections/DiscountRateSection";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function NewLeaseDialog() {
  const [isOpen, setIsOpen] = useState(false);
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
      // Validate required fields
      if (!formData.commencementDate || !formData.expirationDate || !formData.discountRate || 
          !formData.paymentInterval || !formData.paymentType || !formData.basePayment ||
          !formData.contractNumber || !formData.lessorEntity || !formData.rateTableId) {
        throw new Error("Please fill in all required fields");
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Get the rate table details for audit trail
      let rateTableEffectiveDate = null;
      if (formData.rateTableId) {
        const { data: tableData, error: tableError } = await supabase
          .from('discount_rate_tables')
          .select('effective_date')
          .eq('id', formData.rateTableId)
          .single();
        
        if (!tableError && tableData) {
          rateTableEffectiveDate = tableData.effective_date;
        }
      }

      // Determine lease term bucket for audit trail
      const getLeaseTermBucket = (term: number): string => {
        if (term <= 3) return "1-3 year";
        if (term > 3 && term <= 5) return "3-5 year";
        if (term > 5 && term <= 10) return "5-10 year";
        if (term > 10 && term <= 15) return "10-15 year";
        if (term > 15 && term <= 30) return "15-30 year";
        return ">30 year";
      };

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
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error creating lease:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create lease",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-gray-800 text-white">
          <Plus className="mr-2 h-4 w-4" />
          New Lease
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Lease Creation</DialogTitle>
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
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Terms</h3>
            <PaymentTermsSection onPaymentTermsChange={handlePaymentTermsChange} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Asset Classification</h3>
            <AssetClassificationSection 
              onLowValueChange={setIsLowValue}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Discount Rate</h3>
            <DiscountRateSection 
              onRateChange={handleDiscountRateChange}
              onRateTableChange={handleRateTableChange}
              leaseTerm={formData.leaseTerm}
              paymentInterval={formData.paymentInterval}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSubmit}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Add Lease
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
