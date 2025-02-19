
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeaseGrid } from "./LeaseGrid";
import { SearchFilters } from "./SearchFilters";
import { LeaseDetailsModal } from "./LeaseDetailsModal";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Lease = {
  id: string;
  contract_number: string;
  lessor_entity: string;
  commencement_date: string;
  expiration_date: string;
  payment_interval: "monthly" | "quarterly" | "annual";
  is_low_value: boolean;
  created_at: string;
  updated_at: string;
};

export function LeaseSummary() {
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [filters, setFilters] = useState({
    searchText: "",
    activeOnly: false,
    modifiedOnly: false,
    lowValueOnly: false
  });
  const { toast } = useToast();

  const { data: leases, isLoading } = useQuery({
    queryKey: ['leases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('*');
      
      if (error) throw error;
      return data as Lease[];
    }
  });

  const filteredLeases = leases?.filter(lease => {
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

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your PDF is being generated..."
    });
    // Implement PDF export logic here
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SearchFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />
        <Button onClick={handleExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export to PDF
        </Button>
      </div>

      <LeaseGrid 
        leases={filteredLeases || []}
        isLoading={isLoading}
        onLeaseSelect={setSelectedLease}
      />

      <LeaseDetailsModal
        lease={selectedLease}
        onClose={() => setSelectedLease(null)}
      />
    </div>
  );
}
