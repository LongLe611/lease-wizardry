
export type Lease = {
  id: string;
  contract_number?: string;
  lessor_entity: string;
  commencement_date: string;
  expiration_date: string;
  payment_interval: "monthly" | "quarterly" | "annual";
  base_payment: number;
  is_low_value: boolean;
  created_at: string;
  updated_at: string;
  asset_type?: string;
  asset_description?: string;
  payment_timing?: "beginning" | "end";
  deposit_amount?: number;
  interest_rate: number;
  discount_rate: number;
  lease_term: number;
  payment_type?: "fixed" | "variable";
  cpi_index_rate?: number | null;
  base_year?: number | null;
  rate_table_id?: string | null;
};

export type LeaseScheduleRow = {
  period: number;
  startDate: string;
  endDate: string;
  discountFactor: number;
  payment: number;
  presentValue: number;
};

export type MonthlyScheduleRow = {
  date: string;
  openingLiability: number;
  interestExpense: number;
  payment: number;
  principalReduction: number;
  closingLiability: number;
  depreciation: number;
  assetValue: number;
};
