
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lease } from "../types";
import { useState, useEffect } from "react";

export function useLeaseData() {
  // Track last refresh time to display in logs
  const [lastRefreshTime, setLastRefreshTime] = useState<string>("none");
  
  const { data: leases, isLoading, refetch, error } = useQuery({
    queryKey: ['leases'],
    queryFn: async () => {
      const now = new Date().toLocaleTimeString();
      console.log(`Fetching leases data with fresh request at ${now}...`);
      setLastRefreshTime(now);
      
      try {
        const { data, error } = await supabase
          .from('leases')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching leases:', error);
          throw new Error(`Failed to fetch leases: ${error.message}`);
        }
        
        if (!data) {
          console.error('No lease data returned from query');
          return [];
        }
        
        console.log('Leases fetched successfully:', data?.length || 0, 'records');
        
        // Log the details of the lease data for debugging
        if (data && data.length > 0) {
          console.log('First lease data:', {
            id: data[0].id,
            basePayment: data[0].base_payment,
            assetType: data[0].asset_type,
            updatedAt: data[0].updated_at
          });
        }
        
        return data as Lease[];
      } catch (queryError: any) {
        console.error('Exception in lease data fetch:', queryError);
        throw queryError;
      }
    },
    staleTime: 0, // Consider data immediately stale to ensure fresh data on each view
    refetchOnWindowFocus: true, // Refresh when window gets focus
    refetchOnMount: true, // Always refetch when component mounts
    retry: 3, // More retries for network issues
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000), // Exponential backoff
  });

  // Force refresh data periodically if on lease management page
  useEffect(() => {
    // Check if we're on a relevant page
    const isLeasePage = window.location.pathname.includes('lease');
    
    if (isLeasePage) {
      // Refresh data every 30 seconds when on lease pages
      const intervalId = setInterval(() => {
        console.log("Periodic refresh triggered");
        refetch();
      }, 30000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [refetch]);

  return {
    leases,
    isLoading,
    error,
    refetch,
    lastRefreshTime
  };
}
