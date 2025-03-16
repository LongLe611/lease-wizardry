
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useDiscountRateSelector({
  leaseTerm,
  paymentInterval,
  initialDiscountRate = null,
  initialRateTableId = null,
  onRateChange,
  onRateTableChange
}: {
  leaseTerm: number | null;
  paymentInterval: string;
  initialDiscountRate?: number | null;
  initialRateTableId?: string | null;
  onRateChange: (rate: number) => void;
  onRateTableChange: (tableId: string) => void;
}) {
  const [discountRate, setDiscountRate] = useState<number | null>(initialDiscountRate);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(initialRateTableId);
  
  const { data: rateTables, isLoading: isLoadingTables } = useQuery({
    queryKey: ['discount_rate_tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_rate_tables')
        .select('*')
        .order('effective_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Initialize with initial values
  useEffect(() => {
    if (initialDiscountRate !== null) {
      setDiscountRate(initialDiscountRate);
    }
    
    if (initialRateTableId !== null) {
      setSelectedTableId(initialRateTableId);
    }
  }, [initialDiscountRate, initialRateTableId]);

  // When a rate table is selected, fetch appropriate rate
  useEffect(() => {
    if (selectedTableId && leaseTerm) {
      fetchRateForTerm(selectedTableId, leaseTerm);
    }
  }, [selectedTableId, leaseTerm, paymentInterval]);

  const getLeaseTermBucket = (term: number): string => {
    if (term <= 3) return "1-3 year";
    if (term > 3 && term <= 5) return "3-5 year";
    if (term > 5 && term <= 10) return "5-10 year";
    if (term > 10 && term <= 15) return "10-15 year";
    if (term > 15 && term <= 30) return "15-30 year";
    return ">30 year";
  };

  const fetchRateForTerm = async (tableId: string, term: number) => {
    try {
      // Get the term bucket
      const termBucket = getLeaseTermBucket(term);
      
      const { data, error } = await supabase
        .from('discount_rates')
        .select('*')
        .eq('table_id', tableId)
        .eq('lease_term_bucket', termBucket)
        .single();
      
      if (error) {
        console.error('Error fetching discount rate:', error);
        return;
      }
      
      if (data) {
        let rate = data.yearly_rate;
        
        // Adjust rate based on payment interval
        if (paymentInterval === 'monthly') {
          rate = ((Math.pow(1 + rate/100, 1/12) - 1) * 100);
        } else if (paymentInterval === 'quarterly') {
          rate = ((Math.pow(1 + rate/100, 1/4) - 1) * 100);
        }
        
        // Round to 2 decimal places
        rate = Math.round(rate * 100) / 100;
        
        setDiscountRate(rate);
        onRateChange(rate);
      }
    } catch (error) {
      console.error('Error fetching appropriate rate:', error);
    }
  };

  const handleRateTableChange = (id: string) => {
    setSelectedTableId(id);
    onRateTableChange(id);
  };

  const handleManualRateChange = (value: number) => {
    setDiscountRate(value);
    onRateChange(value);
  };

  const refreshRate = () => {
    if (selectedTableId && leaseTerm) {
      fetchRateForTerm(selectedTableId, leaseTerm);
    }
  };

  return {
    discountRate,
    selectedTableId,
    rateTables,
    isLoadingTables,
    handleRateTableChange,
    handleManualRateChange,
    refreshRate
  };
}
