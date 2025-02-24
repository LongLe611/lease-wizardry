
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

interface LeaseGridProps {
  leases: any[];
  isLoading: boolean;
  onLeaseSelect: (lease: any) => void;
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
              isModified(lease) ? "border-blue-500 border-2" : ""
            }`}
          >
            <TableCell>
              <Checkbox
                checked={selectedLeases.includes(lease.id)}
                onCheckedChange={(checked) => onSelectionChange(lease.id, checked === true)}
                onClick={(e) => e.stopPropagation()}
              />
            </TableCell>
            <TableCell>{getStatusIndicator(lease)}</TableCell>
            <TableCell onClick={() => onLeaseSelect(lease)}>{lease.contract_number}</TableCell>
            <TableCell onClick={() => onLeaseSelect(lease)}>{lease.lessor_entity}</TableCell>
            <TableCell onClick={() => onLeaseSelect(lease)}>Property</TableCell>
            <TableCell onClick={() => onLeaseSelect(lease)}>{format(new Date(lease.commencement_date), "PP")}</TableCell>
            <TableCell onClick={() => onLeaseSelect(lease)}>{format(new Date(lease.expiration_date), "PP")}</TableCell>
            <TableCell onClick={() => onLeaseSelect(lease)}>{getRemainingTerm(lease.expiration_date)} years</TableCell>
            <TableCell onClick={() => onLeaseSelect(lease)} className="capitalize">{lease.payment_interval}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
