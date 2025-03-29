
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Lease } from "../../summary/types";
import { formatCurrency, formatNumber } from "../utils/formatters";

interface LeaseDetailsCardProps {
  selectedLease: Lease | null;
}

export function LeaseDetailsCard({ selectedLease }: LeaseDetailsCardProps) {
  if (!selectedLease) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Lessor Name</Label>
            <Input value={selectedLease.lessor_entity} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Asset Type</Label>
            <Input value={selectedLease.asset_type || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Asset Description</Label>
            <Input value={selectedLease.asset_description || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input value={format(new Date(selectedLease.commencement_date), 'PP')} readOnly />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input value={format(new Date(selectedLease.expiration_date), 'PP')} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Payment Amount</Label>
            <Input value={formatCurrency(selectedLease.base_payment)} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Payment Interval</Label>
            <Input value={selectedLease.payment_interval} readOnly className="capitalize" />
          </div>
          <div className="space-y-2">
            <Label>Payment Timing</Label>
            <Input value={selectedLease.payment_timing || 'end'} readOnly className="capitalize" />
          </div>
          <div className="space-y-2">
            <Label>Deposit Amount</Label>
            <Input value={formatCurrency(selectedLease.deposit_amount || 0)} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Discount Rate (%)</Label>
            <Input value={formatNumber(selectedLease.discount_rate)} readOnly />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
