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

  // Explicitly separate checkbox click from row click to prevent conflicts
  const handleCheckboxChange = (lease: Lease, checked: boolean) => {
    console.log(`Checkbox changed for lease ${lease.id}: ${checked}`);
    onSelectionChange(lease.id, checked);
  };

  // When a row is clicked, select the lease (separate from checkbox interaction)
  const handleRowClick = (lease: Lease) => {
    console.log(`Row clicked for lease: ${lease.id}`);
    
    // If the lease is already selected, don't trigger a new selection event
    if (!selectedLeases.includes(lease.id)) {
      onLeaseSelect(lease);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
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
            } cursor-pointer`}
          >
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selectedLeases.includes(lease.id)}
                onCheckedChange={(checked) => handleCheckboxChange(lease, checked === true)}
                onClick={(e) => e.stopPropagation()}
              />
            </TableCell>
            <TableCell onClick={() => handleRowClick(lease)}>{getStatusIndicator(lease)}</TableCell>
            <TableCell onClick={() => handleRowClick(lease)}>{lease.contract_number}</TableCell>
            <TableCell onClick={() => handleRowClick(lease)}>{lease.lessor_entity}</TableCell>
            <TableCell onClick={() => handleRowClick(lease)}>Property</TableCell>
            <TableCell onClick={() => handleRowClick(lease)}>{format(new Date(lease.commencement_date), "PP")}</TableCell>
            <TableCell onClick={() => handleRowClick(lease)}>{format(new Date(lease.expiration_date), "PP")}</TableCell>
            <TableCell onClick={() => handleRowClick(lease)}>{getRemainingTerm(lease.expiration_date)} years</TableCell>
            <TableCell onClick={() => handleRowClick(lease)} className="capitalize">{lease.payment_interval}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
