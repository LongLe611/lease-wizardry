
export type EditLeaseFormData = {
  contractNumber: string;
  lessorEntity: string;
  commencementDate: Date | null;
  expirationDate: Date | null;
  leaseTerm: number | null;
  paymentInterval: string;
  paymentType: string;
  basePayment: number;
  cpiIndexRate: number | null;
  baseYear: number | null;
  discountRate: number | null;
  rateTableId: string | null;
  leaseTermBucket: string | null;
  assetCategory: string | null;
};
