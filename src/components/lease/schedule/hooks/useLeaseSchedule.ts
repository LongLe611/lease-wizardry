
import { useMemo } from "react";
import { format, addMonths, subDays } from "date-fns";
import { Lease, LeaseScheduleRow, MonthlyScheduleRow } from "../../summary/types";

export function useLeaseSchedule(selectedLease: Lease | undefined) {
  const getIntervalMonths = (paymentInterval: string): number => {
    switch (paymentInterval.toLowerCase()) {
      case 'quarterly':
        return 3;
      case 'annual':
        return 12;
      case 'monthly':
      default:
        return 1;
    }
  };

  const leaseSchedule = useMemo(() => {
    if (!selectedLease) return [];

    const intervalMonths = getIntervalMonths(selectedLease.payment_interval);
    const periodsPerYear = 12 / intervalMonths;
    const discountRatePerPeriod = selectedLease.discount_rate / 100 / periodsPerYear;
    const totalPeriods = Math.ceil(selectedLease.lease_term * periodsPerYear);
    const schedule: LeaseScheduleRow[] = [];

    for (let i = 0; i < totalPeriods; i++) {
      const discountFactor = 1 / Math.pow(1 + discountRatePerPeriod, i + 1);
      const startDate = new Date(selectedLease.commencement_date);
      startDate.setMonth(startDate.getMonth() + i * intervalMonths);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + intervalMonths);
      endDate.setDate(endDate.getDate() - 1);

      schedule.push({
        period: i + 1,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        discountFactor,
        payment: selectedLease.base_payment,
        presentValue: selectedLease.base_payment * discountFactor,
      });
    }

    return schedule;
  }, [selectedLease]);

  const monthlySchedule = useMemo(() => {
    if (!selectedLease) return [];

    const discountRatePerMonth = selectedLease.discount_rate / 100 / 12;
    const totalPeriods = selectedLease.lease_term * 12;
    const schedule: MonthlyScheduleRow[] = [];
    const totalPV = leaseSchedule.reduce((sum, row) => sum + row.presentValue, 0);
    const monthlyDepreciation = totalPV / totalPeriods;

    let openingLiability = totalPV;

    for (let i = 0; i < totalPeriods; i++) {
      const interestExpense = openingLiability * discountRatePerMonth;
      
      let payment = 0;
      const intervalMonths = getIntervalMonths(selectedLease.payment_interval);
      if (i % intervalMonths === 0) {
        payment = selectedLease.base_payment;
      }
      
      const principalReduction = payment - interestExpense;
      const closingLiability = openingLiability - principalReduction;
      const date = new Date(selectedLease.commencement_date);
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
  }, [selectedLease, leaseSchedule]);

  return {
    leaseSchedule,
    monthlySchedule
  };
}
