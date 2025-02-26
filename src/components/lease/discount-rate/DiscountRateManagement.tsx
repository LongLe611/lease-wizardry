import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Save, Trash2, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
  const [newVersionDate, setNewVersionDate] = useState<Date>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [localRates, setLocalRates] = useState<DiscountRate[]>([]);

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

  useEffect(() => {
    if (rates) {
      setLocalRates(rates);
      setUnsavedChanges(false);
    }
  }, [rates]);

  const createRateTable = useMutation({
    mutationFn: async (effectiveDate: Date) => {
      const { data: tableData, error: tableError } = await supabase
        .from('discount_rate_tables')
        .insert([{ 
          effective_date: format(effectiveDate, 'yyyy-MM-dd'),
          is_current: true 
        }])
        .select()
        .single();

      if (tableError) throw tableError;

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['discount-rate-tables'] });
      setSelectedTableId(data.id);
      setIsCreateDialogOpen(false);
      setNewVersionDate(undefined);
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

  const deleteRateTable = useMutation({
    mutationFn: async (tableId: string) => {
      const { error } = await supabase
        .from('discount_rate_tables')
        .delete()
        .eq('id', tableId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-rate-tables'] });
      const newCurrentTable = rateTables?.find(t => t.id !== selectedTableId);
      setSelectedTableId(newCurrentTable?.id || "");
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Rate table deleted successfully",
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

  const updateRates = useMutation({
    mutationFn: async (rates: DiscountRate[]) => {
      const { error } = await supabase
        .from('discount_rates')
        .upsert(rates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-rates', selectedTableId] });
      setUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Rates updated successfully",
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
    if (newVersionDate) {
      createRateTable.mutate(newVersionDate);
    }
  };

  const handleDeleteTable = () => {
    if (selectedTableId && (!rateTables || rateTables.length > 1)) {
      deleteRateTable.mutate(selectedTableId);
    }
  };

  const handleRateChange = (bucket: string, value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      const newRates = localRates.map(rate => 
        rate.lease_term_bucket === bucket 
          ? { ...rate, yearly_rate: numericValue }
          : rate
      );
      setLocalRates(newRates);
      setUnsavedChanges(true);
    }
  };

  const handleApplyChanges = () => {
    if (unsavedChanges && localRates.length > 0) {
      updateRates.mutate(localRates);
    }
  };

  const selectedTable = rateTables?.find(table => table.id === selectedTableId);

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
        <div className="flex gap-2">
          {selectedTableId && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Rate Table
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the rate table
                          and all its associated rates.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTable}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TooltipTrigger>
                <TooltipContent>Delete this rate table version</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={handleApplyChanges}
                  disabled={!unsavedChanges}
                >
                  <Save className="mr-2 h-4 w-4" /> 
                  Apply Changes
                  {unsavedChanges && (
                    <span className="ml-2 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save changes to the current rate table</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Rate Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Rate Table</DialogTitle>
                <DialogDescription>
                  Select an effective date for the new rate table. This will create a new version
                  with the current rates as a starting point.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="version-date">Version Date</Label>
                <Calendar
                  mode="single"
                  selected={newVersionDate}
                  onSelect={setNewVersionDate}
                  initialFocus
                  className="rounded-md border"
                />
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateNewTable}
                  disabled={!newVersionDate}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Discount Rates
                {selectedTable && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    Version: {format(new Date(selectedTable.effective_date), 'dd-MMM-yyyy')}
                  </span>
                )}
              </CardTitle>
              {selectedTable?.is_current && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm text-green-600">
                        <Info className="mr-1 h-4 w-4" />
                        Current Version
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>This is the current rate table used for new leases</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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
                    const rate = localRates?.find(r => r.lease_term_bucket === bucket);
                    const yearlyRate = rate?.yearly_rate || 0;
                    
                    return (
                      <TableRow key={bucket}>
                        <TableCell>{bucket}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={yearlyRate}
                            onChange={(e) => handleRateChange(bucket, e.target.value)}
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
