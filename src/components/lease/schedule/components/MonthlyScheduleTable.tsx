
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MonthlyScheduleRow } from "../../summary/types";
import { formatCurrency } from "../utils/formatters";

interface MonthlyScheduleTableProps {
  monthlySchedule: MonthlyScheduleRow[];
}

export function MonthlyScheduleTable({ monthlySchedule }: MonthlyScheduleTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Opening Liability</TableHead>
            <TableHead className="text-right">Interest Expense</TableHead>
            <TableHead className="text-right">Payment</TableHead>
            <TableHead className="text-right">Principal Reduction</TableHead>
            <TableHead className="text-right">Closing Liability</TableHead>
            <TableHead className="text-right">Depreciation</TableHead>
            <TableHead className="text-right">Asset Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monthlySchedule.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{format(new Date(row.date), 'PP')}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.openingLiability)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.interestExpense)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.payment)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.principalReduction)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.closingLiability)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.depreciation)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.assetValue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
