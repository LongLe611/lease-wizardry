
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lease } from "../types";

export function useLeaseData() {
  const { data: leases, isLoading, refetch } = useQuery({
    queryKey: ['leases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('*');
      
      if (error) throw error;
      return data as Lease[];
    }
  });

  return {
    leases,
    isLoading,
    refetch
  };
}
