
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, InfoCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface DiscountRateSectionProps {
  onRateChange: (rate: number) => void;
  onRateTableChange: (tableId: string) => void;
  leaseTerm: number | null;
  paymentInterval: string;
}

type DiscountRateTable = {
  id: string;
  effective_date: string;
  is_current: boolean;
};

type DiscountRate = {
  id: string;
  table_id: string;
  lease_term_bucket: string;
  yearly_rate: number;
};

export function DiscountRateSection({ 
  onRateChange, 
  onRateTableChange,
  leaseTerm, 
  paymentInterval 
}: DiscountRateSectionProps) {
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [discountRate, setDiscountRate] = useState<number | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [autoSelected, setAutoSelected] = useState(false);

  // Fetch rate tables
  const { data: rateTables, isLoading: isLoadingTables } = useQuery({
    queryKey: ['discount-rate-tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_rate_tables')
        .select('*')
        .order('effective_date', { ascending: false });
      
      if (error) throw error;
      return data as DiscountRateTable[];
    }
  });

  // Fetch rates for selected table
  const { data: rates, isLoading: isLoadingRates } = useQuery({
    queryKey: ['discount-rates', selectedTableId],
    queryFn: async () => {
      if (!selectedTableId) return [];
      const { data, error } = await supabase
        .from('discount_rates')
        .select('*')
        .eq('table_id', selectedTableId);
      
      if (error) throw error;
      return data as DiscountRate[];
    },
    enabled: !!selectedTableId
  });

  // Set default rate table (most recent/current) when data loads
  useEffect(() => {
    if (rateTables && rateTables.length > 0) {
      // Find the current table or use the most recent one
      const currentTable = rateTables.find(table => table.is_current);
      if (currentTable) {
        setSelectedTableId(currentTable.id);
        onRateTableChange(currentTable.id);
      } else {
        setSelectedTableId(rateTables[0].id);
        onRateTableChange(rateTables[0].id);
      }
    }
  }, [rateTables, onRateTableChange]);

  // Determine lease term bucket
  const getLeaseTermBucket = (term: number): string => {
    if (term <= 3) return "1-3 year";
    if (term > 3 && term <= 5) return "3-5 year";
    if (term > 5 && term <= 10) return "5-10 year";
    if (term > 10 && term <= 15) return "10-15 year";
    if (term > 15 && term <= 30) return "15-30 year";
    return ">30 year";
  };

  // Calculate payment rate based on yearly rate and frequency
  const calculatePaymentRate = (yearlyRate: number, frequency: string): number => {
    if (yearlyRate === 0) return 0;
    
    const periodsPerYear: Record<string, number> = {
      'annual': 1,
      'quarterly': 4,
      'monthly': 12
    };
    
    // For semi-annual, use 2 periods per year
    const periodsMap: Record<string, number> = {
      ...periodsPerYear,
      'semi-annual': 2
    };
    
    const periods = periodsMap[frequency.toLowerCase()] || 1;
    const rate = (Math.pow(1 + yearlyRate/100, 1/periods) - 1) * 100;
    return parseFloat(rate.toFixed(4));
  };

  // Auto-calculate discount rate when all required fields are available
  useEffect(() => {
    if (!selectedTableId || !leaseTerm || !paymentInterval || !rates?.length) {
      setWarningMessage("");
      return;
    }
    
    if (manualEntry) return;
    
    // Determine lease term bucket
    const bucket = getLeaseTermBucket(leaseTerm);
    setSelectedBucket(bucket);
    
    // Find the rate for this bucket
    const bucketRate = rates.find(r => r.lease_term_bucket === bucket);
    
    if (!bucketRate || bucketRate.yearly_rate === 0) {
      setWarningMessage(`No rate defined for ${bucket} in the selected table.`);
      setDiscountRate(null);
      onRateChange(0);
      setAutoSelected(false);
      return;
    }
    
    // Calculate the appropriate rate based on payment interval
    const yearlyRate = bucketRate.yearly_rate;
    let intervalRate: number;
    
    // Map payment interval to corresponding rate calculation
    switch (paymentInterval.toLowerCase()) {
      case 'monthly':
        intervalRate = calculatePaymentRate(yearlyRate, 'monthly');
        break;
      case 'quarterly':
        intervalRate = calculatePaymentRate(yearlyRate, 'quarterly');
        break;
      case 'annual':
        intervalRate = yearlyRate;
        break;
      default:
        // Assume semi-annual for anything else
        intervalRate = calculatePaymentRate(yearlyRate, 'semi-annual');
    }
    
    setDiscountRate(intervalRate);
    onRateChange(intervalRate);
    setWarningMessage("");
    setAutoSelected(true);
  }, [selectedTableId, leaseTerm, paymentInterval, rates, onRateChange, manualEntry]);

  const handleTableChange = (tableId: string) => {
    setSelectedTableId(tableId);
    onRateTableChange(tableId);
    setManualEntry(false);
    setAutoSelected(false);
  };

  const handleManualRateChange = (value: string) => {
    const rate = parseFloat(value);
    if (!isNaN(rate)) {
      onRateChange(rate);
      setDiscountRate(rate);
    }
  };

  const handleRefresh = () => {
    setManualEntry(false);
    // This will trigger the useEffect to recalculate
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rate-table">Rate Table Version</Label>
        <Select value={selectedTableId} onValueChange={handleTableChange}>
          <SelectTrigger id="rate-table" className="w-full">
            <SelectValue placeholder="Select a rate table version" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingTables ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
              </div>
            ) : (
              rateTables?.map(table => (
                <SelectItem key={table.id} value={table.id}>
                  {format(new Date(table.effective_date), 'dd-MMM-yyyy')}
                  {table.is_current && " (Current)"}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="discount-rate">Discount Rate (%)</Label>
          {autoSelected && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Auto-selected
            </div>
          )}
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Input
              id="discount-rate"
              type="number"
              step="0.0001"
              value={discountRate !== null ? discountRate : ''}
              onChange={(e) => {
                setManualEntry(true);
                handleManualRateChange(e.target.value);
              }}
              readOnly={autoSelected && !manualEntry}
              required
              className={autoSelected && !manualEntry ? "bg-gray-50" : ""}
            />
            {autoSelected && !manualEntry && (
              <div className="absolute inset-0 bg-gray-50 opacity-50 pointer-events-none" />
            )}
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={handleRefresh}
                  disabled={!leaseTerm || !paymentInterval}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Recalculate rate based on lease term and payment interval</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {selectedBucket && autoSelected && (
          <p className="text-xs text-muted-foreground">
            Using rate from {selectedBucket} bucket with {paymentInterval.toLowerCase()} payment frequency
          </p>
        )}
        
        {warningMessage && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-3">
              <div className="flex items-start text-sm text-yellow-800">
                <InfoCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{warningMessage}</p>
                  <p className="mt-1">Please enter a rate manually or select a different table.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
