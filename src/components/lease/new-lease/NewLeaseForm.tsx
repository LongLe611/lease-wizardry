
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractDetailsSection } from "./sections/ContractDetailsSection";
import { PaymentTermsSection } from "./sections/PaymentTermsSection";
import { AssetClassificationSection } from "./sections/AssetClassificationSection";
import { DiscountRateSection } from "./sections/DiscountRateSection";

export function NewLeaseForm() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractDetailsSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentTermsSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset Classification</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetClassificationSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discount Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <DiscountRateSection />
        </CardContent>
      </Card>
    </div>
  );
}
