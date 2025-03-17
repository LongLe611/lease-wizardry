
import { useState } from "react";
import { Lease } from "../types";

export interface LeaseFilters {
  searchText: string;
  activeOnly: boolean;
  modifiedOnly: boolean;
  lowValueOnly: boolean;
}

export function useLeaseFilters() {
  const [filters, setFilters] = useState<LeaseFilters>({
    searchText: "",
    activeOnly: false,
    modifiedOnly: false,
    lowValueOnly: false
  });

  const applyFilters = (leases: Lease[] | undefined) => {
    if (!leases) return [];
    
    return leases.filter(lease => {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        if (!lease.lessor_entity.toLowerCase().includes(searchLower) &&
            !lease.contract_number?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      if (filters.activeOnly) {
        const isExpired = new Date(lease.expiration_date) < new Date();
        if (isExpired) return false;
      }
      if (filters.modifiedOnly) {
        if (lease.created_at === lease.updated_at) return false;
      }
      if (filters.lowValueOnly) {
        if (!lease.is_low_value) return false;
      }
      return true;
    });
  };

  return {
    filters,
    setFilters,
    applyFilters
  };
}
