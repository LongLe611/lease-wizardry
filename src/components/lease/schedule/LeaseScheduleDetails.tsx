
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Lease, LeaseScheduleRow, MonthlyScheduleRow } from "../summary/types";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export function LeaseScheduleDetails() {
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>("");

  const { data: leases } = useQuery({
    queryKey: ['leases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .order('contract_number');
      
      if (error) throw error;
      return data as Lease[];
    }
  });

  const selectedLease = useMemo(() => {
    return leases?.find(lease => lease.id === selectedLeaseId);
  }, [leases, selectedLeaseId]);

  // Calculate discount factors and present values
  const calculateSchedule = (lease: Lease): LeaseScheduleRow[] => {
    if (!lease) return [];

    const monthlyRate = lease.interest_rate / 100 / 12;
    const totalPeriods = lease.lease_term * 12;
    const schedule: LeaseScheduleRow[] = [];

    for (let i = 0; i < totalPeriods; i++) {
      const discountFactor = 1 / Math.pow(1 + monthlyRate, i + 1);
      const startDate = new Date(lease.commencement_date);
      startDate.setMonth(startDate.getMonth() + i);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      schedule.push({
        period: i + 1,
        months: 1,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        discountFactor,
        payment: lease.base_payment,
        presentValue: lease.base_payment * discountFactor,
      });
    }

    return schedule;
  };

  // Calculate monthly amortization schedule
  const calculateMonthlySchedule = (lease: Lease): MonthlyScheduleRow[] => {
    if (!lease) return [];

    const monthlyRate = lease.interest_rate / 100 / 12;
    const totalPeriods = lease.lease_term * 12;
    const schedule: MonthlyScheduleRow[] = [];
    const totalPV = calculateSchedule(lease).reduce((sum, row) => sum + row.presentValue, 0);
    const monthlyDepreciation = totalPV / totalPeriods;

    let openingLiability = totalPV;

    for (let i = 0; i < totalPeriods; i++) {
      const interestExpense = openingLiability * monthlyRate;
      const payment = lease.base_payment;
      const principalReduction = payment - interestExpense;
      const closingLiability = openingLiability - principalReduction;
      const date = new Date(lease.commencement_date);
      date.setMonth(date.getMonth() + i);

      schedule.push({
        date: format(date, 'yyyy-MM-dd'),
        openingLiability,
        interestExpense,
        payment,
        principalReduction,
        closingLiability,
        depreciation: monthlyDepreciation,
        assetValue: totalPV - (monthlyDepreciation * (i + 1)),
      });

      openingLiability = closingLiability;
    }

    return schedule;
  };

  const leaseSchedule = useMemo(() => {
    return selectedLease ? calculateSchedule(selectedLease) : [];
  }, [selectedLease]);

  const monthlySchedule = useMemo(() => {
    return selectedLease ? calculateMonthlySchedule(selectedLease) : [];
  }, [selectedLease]);

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Contract Number</Label>
              <Select value={selectedLeaseId} onValueChange={setSelectedLeaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lease contract" />
                </SelectTrigger>
                <SelectContent>
                  {leases?.map(lease => (
                    <SelectItem key={lease.id} value={lease.id}>
                      {lease.contract_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLease && (
              <>
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
                  <Label>Interest Rate (%)</Label>
                  <Input value={formatNumber(selectedLease.interest_rate)} readOnly />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedLease && (
        <Tabs defaultValue="calculations" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="calculations" className="flex-1">Liability Calculation</TabsTrigger>
            <TabsTrigger value="schedule" className="flex-1">Monthly Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="calculations">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Months</TableHead>
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
                          <TableCell>{row.months}</TableCell>
                          <TableCell>{format(new Date(row.startDate), 'PP')}</TableCell>
                          <TableCell>{format(new Date(row.endDate), 'PP')}</TableCell>
                          <TableCell className="text-right">{formatNumber(row.discountFactor, 4)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(row.payment)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(row.presentValue)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted">
                        <TableCell colSpan={5}>Total</TableCell>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
