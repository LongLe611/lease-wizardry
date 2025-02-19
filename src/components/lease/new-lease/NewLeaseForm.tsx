
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractDetailsSection } from "./sections/ContractDetailsSection";
import { PaymentTermsSection } from "./sections/PaymentTermsSection";
import { AssetClassificationSection } from "./sections/AssetClassificationSection";
import { DiscountRateSection } from "./sections/DiscountRateSection";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function NewLeaseForm() {
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

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.commencementDate || !formData.expirationDate || !formData.discountRate || 
          !formData.paymentInterval || !formData.paymentType || !formData.basePayment ||
          !formData.contractNumber || !formData.lessorEntity) {
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
        user_id: userData.user.id
      };

      const { error: insertError } = await supabase
        .from('leases')
        .insert(leaseData);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Lease has been successfully created",
      });
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractDetailsSection 
            isLowValue={isLowValue}
            onDateChange={handleDateChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentTermsSection onPaymentTermsChange={handlePaymentTermsChange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset Classification</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetClassificationSection 
            onLowValueChange={setIsLowValue}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discount Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <DiscountRateSection onRateChange={handleDiscountRateChange} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          className="w-full md:w-auto"
        >
          Add Lease
        </Button>
      </div>
    </div>
  );
}
