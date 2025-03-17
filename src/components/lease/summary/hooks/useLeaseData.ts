
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
      return data as Lease[];
    }
  });

  return {
    leases,
    isLoading,
    error,
    refetch
  };
}
