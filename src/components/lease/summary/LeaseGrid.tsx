
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { AlertOctagon, CheckSquare, XOctagon } from "lucide-react";
import { Lease } from "./types";

interface LeaseGridProps {
  leases: Lease[];
  isLoading: boolean;
  onLeaseSelect: (lease: Lease) => void;
  selectedLeases: string[];
  onSelectionChange: (id: string, isSelected: boolean) => void;
}

export function LeaseGrid({ 
  leases, 
  isLoading, 
  onLeaseSelect,
  selectedLeases,
  onSelectionChange
}: LeaseGridProps) {
  const getRemainingTerm = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffYears = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.max(0, Number(diffYears.toFixed(2)));
  };

  const getStatusIndicator = (lease: any) => {
    const endDate = new Date(lease.expiration_date);
    const now = new Date();
    const monthsToExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (endDate < now) {
      return <XOctagon className="h-5 w-5 text-red-500" />;
    } else if (monthsToExpiry <= 3) {
      return <AlertOctagon className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckSquare className="h-5 w-5 text-green-500" />;
  };

  const isModified = (lease: any) => {
    return lease.created_at !== lease.updated_at;
  };

  // Handle checkbox change
  const handleCheckboxChange = (leaseId: string, checked: boolean, event: React.MouseEvent) => {
    // Don't let the event bubble up to the row
    if (event) {
      event.stopPropagation();
    }
    
    console.log(`Checkbox changed for lease ${leaseId}: ${checked}`);
    onSelectionChange(leaseId, checked);
  };

  // Contract number click handler - only opens the lease details popup
  const handleContractNumberClick = (lease: Lease, event: React.MouseEvent) => {
    console.log(`Contract number clicked for lease: ${lease.id}`);
    event.stopPropagation();
    onLeaseSelect(lease);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Select</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Contract Number</TableHead>
          <TableHead>Lessor Legal Entity</TableHead>
          <TableHead>Asset Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Remaining Term</TableHead>
          <TableHead>Payment Frequency</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leases.map((lease) => (
          <TableRow
            key={lease.id}
            className={`${
              selectedLeases.includes(lease.id) ? "bg-muted/50" : ""
            } ${
              isModified(lease) ? "border-blue-500 border-2" : ""
            }`}
          >
            <TableCell className="p-0 pl-4" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selectedLeases.includes(lease.id)}
                onCheckedChange={(checked) => {
                  handleCheckboxChange(lease.id, checked === true, null as any);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="cursor-pointer"
              />
            </TableCell>
            <TableCell>{getStatusIndicator(lease)}</TableCell>
            <TableCell 
              className="cursor-pointer hover:text-blue-600 hover:underline"
              onClick={(event) => handleContractNumberClick(lease, event)}
            >
              {lease.contract_number}
            </TableCell>
            <TableCell>{lease.lessor_entity}</TableCell>
            <TableCell>Property</TableCell>
            <TableCell>{format(new Date(lease.commencement_date), "PP")}</TableCell>
            <TableCell>{format(new Date(lease.expiration_date), "PP")}</TableCell>
            <TableCell>{getRemainingTerm(lease.expiration_date)} years</TableCell>
            <TableCell className="capitalize">{lease.payment_interval}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
