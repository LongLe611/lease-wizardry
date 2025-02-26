
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type DiscountRateTable = {
  id: string;
  effective_date: string;
  is_current: boolean;
  created_at: string;
};

type DiscountRate = {
  id: string;
  table_id: string;
  lease_term_bucket: string;
  yearly_rate: number;
};

const LEASE_TERM_BUCKETS = [
  "1-3 year",
  "3-5 year",
  "5-10 year",
  "10-15 year",
  "15-30 year",
  ">30 year"
] as const;

const calculatePaymentRate = (yearlyRate: number, frequency: string) => {
  const periodsPerYear = {
    'yearly': 1,
    'semi-annual': 2,
    'quarterly': 4,
    'monthly': 12
  };
  const rate = (Math.pow(1 + yearlyRate/100, 1/periodsPerYear[frequency]) - 1) * 100;
  return rate.toFixed(4);
};

export function DiscountRateManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  // Fetch rate tables
  const { data: rateTables } = useQuery({
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
  const { data: rates } = useQuery({
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

  // Create new rate table mutation
  const createRateTable = useMutation({
    mutationFn: async (effectiveDate: string) => {
      const { data: tableData, error: tableError } = await supabase
        .from('discount_rate_tables')
        .insert([{ 
          effective_date: effectiveDate,
          is_current: true 
        }])
        .select()
        .single();

      if (tableError) throw tableError;

      // Copy rates from most recent table or create default rates
      const previousRates = rates || [];
      const newRates = LEASE_TERM_BUCKETS.map(bucket => ({
        table_id: tableData.id,
        lease_term_bucket: bucket,
        yearly_rate: previousRates.find(r => r.lease_term_bucket === bucket)?.yearly_rate || 0
      }));

      const { error: ratesError } = await supabase
        .from('discount_rates')
        .insert(newRates);

      if (ratesError) throw ratesError;
      return tableData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-rate-tables'] });
      toast({
        title: "Success",
        description: "New rate table created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update rate mutation
  const updateRate = useMutation({
    mutationFn: async ({ id, yearly_rate }: { id: string, yearly_rate: number }) => {
      const { error } = await supabase
        .from('discount_rates')
        .update({ yearly_rate })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-rates', selectedTableId] });
      toast({
        title: "Success",
        description: "Rate updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCreateNewTable = () => {
    const today = new Date().toISOString().split('T')[0];
    createRateTable.mutate(today);
  };

  const handleRateChange = (rateId: string, value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      updateRate.mutate({ id: rateId, yearly_rate: numericValue });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Incremental Borrowing Rates for Lease Calculations
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage and view historical discount rates for lease calculations
          </p>
        </div>
        <Button onClick={handleCreateNewTable}>
          <Plus className="mr-2 h-4 w-4" /> New Rate Table
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Rate Table Version</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTableId} onValueChange={setSelectedTableId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a rate table version" />
            </SelectTrigger>
            <SelectContent>
              {rateTables?.map(table => (
                <SelectItem key={table.id} value={table.id}>
                  {format(new Date(table.effective_date), 'dd-MMM-yyyy')}
                  {table.is_current && " (Current)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTableId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Discount Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lease Term</TableHead>
                    <TableHead className="text-right">Yearly Payment (%)</TableHead>
                    <TableHead className="text-right">Semi-annual Payment (%)</TableHead>
                    <TableHead className="text-right">Quarterly Payment (%)</TableHead>
                    <TableHead className="text-right">Monthly Payment (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {LEASE_TERM_BUCKETS.map(bucket => {
                    const rate = rates?.find(r => r.lease_term_bucket === bucket);
                    const yearlyRate = rate?.yearly_rate || 0;
                    
                    return (
                      <TableRow key={bucket}>
                        <TableCell>{bucket}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={yearlyRate}
                            onChange={(e) => rate && handleRateChange(rate.id, e.target.value)}
                            step="0.01"
                            className="w-24 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">{calculatePaymentRate(yearlyRate, 'semi-annual')}</TableCell>
                        <TableCell className="text-right">{calculatePaymentRate(yearlyRate, 'quarterly')}</TableCell>
                        <TableCell className="text-right">{calculatePaymentRate(yearlyRate, 'monthly')}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
