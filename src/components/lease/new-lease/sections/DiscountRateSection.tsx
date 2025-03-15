
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DiscountRateSectionProps {
  onRateChange: (rate: number) => void;
  onRateTableChange: (tableId: string) => void;
  leaseTerm: number | null;
  paymentInterval: string;
  initialDiscountRate?: number | null;
  initialRateTableId?: string | null;
}

export function DiscountRateSection({ 
  onRateChange, 
  onRateTableChange,
  leaseTerm,
  paymentInterval,
  initialDiscountRate = null,
  initialRateTableId = null
}: DiscountRateSectionProps) {
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

  const getLeaseTermBucket = (term: number): string => {
    if (term <= 3) return "1-3 year";
    if (term > 3 && term <= 5) return "3-5 year";
    if (term > 5 && term <= 10) return "5-10 year";
    if (term > 10 && term <= 15) return "10-15 year";
    if (term > 15 && term <= 30) return "15-30 year";
    return ">30 year";
  };

  const handleRateTableChange = (id: string) => {
    setSelectedTableId(id);
    onRateTableChange(id);
  };

  const handleManualRateChange = (value: number) => {
    setDiscountRate(value);
    onRateChange(value);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rate-table">Rate Table Version</Label>
        <Select 
          value={selectedTableId || ''} 
          onValueChange={handleRateTableChange}
          disabled={isLoadingTables}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select rate table" />
          </SelectTrigger>
          <SelectContent>
            {rateTables?.map((table) => (
              <SelectItem key={table.id} value={table.id}>
                {formatDate(table.effective_date)}
                {table.is_current && " (Current)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="discount-rate" className="mr-2">Discount Rate (%)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">About Discount Rates</h4>
                <p className="text-sm text-muted-foreground">
                  This rate is used to calculate the present value of lease payments.
                  It should reflect your incremental borrowing rate or the rate implicit in the lease.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center">
          <Input
            id="discount-rate"
            type="number"
            step="0.01"
            value={discountRate || ''}
            onChange={(e) => handleManualRateChange(Number(e.target.value))}
            className="w-full"
            required
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="ml-2"
            onClick={() => fetchRateForTerm(selectedTableId!, leaseTerm!)}
            disabled={!selectedTableId || !leaseTerm}
          >
            ↻
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedTableId ? 
            "Rate automatically selected based on lease term and payment frequency" : 
            "Select a rate table to automatically set rate based on lease term"}
        </p>
      </div>
    </div>
  );
}
