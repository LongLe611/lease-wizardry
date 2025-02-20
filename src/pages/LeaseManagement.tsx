
import { NewLeaseDialog } from "@/components/lease/new-lease/NewLeaseDialog";
import { LeaseSummary } from "@/components/lease/summary/LeaseSummary";

export default function LeaseManagement() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Lease Management</h1>
      <LeaseSummary />
    </div>
  );
}
