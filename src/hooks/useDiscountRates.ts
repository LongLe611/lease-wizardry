
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDiscountRates(effectiveDate?: string) {
  return useQuery({
    queryKey: ['discount-rates', 'effective', effectiveDate],
    queryFn: async () => {
      if (!effectiveDate) return null;

      const { data, error } = await supabase
        .from('discount_rate_tables')
        .select(`
          id,
          effective_date,
          discount_rates (*)
        `)
        .lte('effective_date', effectiveDate)
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!effectiveDate
  });
}

export function useCurrentDiscountRates() {
  return useQuery({
    queryKey: ['discount-rates', 'current'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_rate_tables')
        .select(`
          id,
          effective_date,
          discount_rates (*)
        `)
        .eq('is_current', true)
        .single();

      if (error) throw error;
      return data;
    }
  });
}
