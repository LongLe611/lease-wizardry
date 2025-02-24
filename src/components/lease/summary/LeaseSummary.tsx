
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeaseGrid } from "./LeaseGrid";
import { SearchFilters } from "./SearchFilters";
import { LeaseDetailsModal } from "./LeaseDetailsModal";
import { Button } from "@/components/ui/button";
import { FileDown, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NewLeaseDialog } from "../new-lease/NewLeaseDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Lease = {
  id: string;
  contract_number?: string;
  lessor_entity: string;
  commencement_date: string;
  expiration_date: string;
  payment_interval: "monthly" | "quarterly" | "annual";
  base_payment: number;
  is_low_value: boolean;
  created_at: string;
  updated_at: string;
};

export function LeaseSummary() {
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [selectedLeases, setSelectedLeases] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    searchText: "",
    activeOnly: false,
    modifiedOnly: false,
    lowValueOnly: false
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const filteredLeases = leases?.filter(lease => {
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      if (!lease.lessor_entity.toLowerCase().includes(searchLower) &&
          !lease.contract_number?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (filters.activeOnly) {
      const isExpired = new Date(lease.expiration_date) < new Date();
      if (isExpired) return false;
    }
    if (filters.modifiedOnly) {
      if (lease.created_at === lease.updated_at) return false;
    }
    if (filters.lowValueOnly) {
      if (!lease.is_low_value) return false;
    }
    return true;
  });

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your PDF is being generated..."
    });
    // Implement PDF export logic here
  };

  const handleSelectionChange = (id: string, isSelected: boolean) => {
    setSelectedLeases(prev => 
      isSelected 
        ? [...prev, id]
        : prev.filter(leaseId => leaseId !== id)
    );
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('leases')
        .delete()
        .in('id', selectedLeases);

      if (error) throw error;

      // Invalidate and refetch the query to update the UI
      await queryClient.invalidateQueries({ queryKey: ['leases'] });
      await refetch();

      toast({
        title: "Success",
        description: `${selectedLeases.length} lease(s) deleted successfully`
      });

      setSelectedLeases([]); // Clear selection after successful delete
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete leases",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SearchFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />
        <div className="flex items-center gap-2">
          {selectedLeases.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedLeases.length} item{selectedLeases.length !== 1 ? 's' : ''} selected
            </span>
          )}
          <Button onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={selectedLeases.length === 0 || isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Lease{selectedLeases.length !== 1 ? 's' : ''}
          </Button>
          <NewLeaseDialog />
        </div>
      </div>

      <LeaseGrid 
        leases={filteredLeases || []}
        isLoading={isLoading}
        onLeaseSelect={setSelectedLease}
        selectedLeases={selectedLeases}
        onSelectionChange={handleSelectionChange}
      />

      <LeaseDetailsModal
        lease={selectedLease}
        onClose={() => setSelectedLease(null)}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedLeases.length} selected lease{selectedLeases.length !== 1 ? 's' : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
