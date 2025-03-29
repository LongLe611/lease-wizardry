
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeaseScheduleRow } from "../../summary/types";
import { formatCurrency, formatNumber } from "../utils/formatters";

interface LiabilityCalculationTableProps {
  leaseSchedule: LeaseScheduleRow[];
}

export function LiabilityCalculationTable({ leaseSchedule }: LiabilityCalculationTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Discount Factor</TableHead>
            <TableHead className="text-right">Payment</TableHead>
            <TableHead className="text-right">Present Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaseSchedule.map((row) => (
            <TableRow key={row.period}>
              <TableCell>{row.period}</TableCell>
              <TableCell>{format(new Date(row.startDate), 'PP')}</TableCell>
              <TableCell>{format(new Date(row.endDate), 'PP')}</TableCell>
              <TableCell className="text-right">{formatNumber(row.discountFactor, 4)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.payment)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.presentValue)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold bg-muted">
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell className="text-right">
              {formatCurrency(leaseSchedule.reduce((sum, row) => sum + row.payment, 0))}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(leaseSchedule.reduce((sum, row) => sum + row.presentValue, 0))}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
