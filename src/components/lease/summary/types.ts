
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
};
