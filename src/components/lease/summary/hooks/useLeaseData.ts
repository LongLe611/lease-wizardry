
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lease } from "../types";

export function useLeaseData() {
  const { data: leases, isLoading, refetch, error } = useQuery({
    queryKey: ['leases'],
    queryFn: async () => {
      console.log('Fetching leases data...');
      const { data, error } = await supabase
        .from('leases')
        .select('*');
      
      if (error) {
        console.error('Error fetching leases:', error);
        throw error;
      }
      console.log('Leases fetched successfully:', data?.length || 0, 'records');
      
      // Log the details of the lease data for debugging
      if (data && data.length > 0) {
        console.log('Sample lease data:', {
          id: data[0].id,
          basePayment: data[0].base_payment,
          assetType: data[0].asset_type,
          updatedAt: data[0].updated_at
        });
      }
      
      return data as Lease[];
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refresh when window gets focus
  });

  return {
    leases,
    isLoading,
    error,
    refetch
  };
}
