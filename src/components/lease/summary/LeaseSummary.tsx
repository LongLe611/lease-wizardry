import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeaseGrid } from "./LeaseGrid";
import { SearchFilters } from "./SearchFilters";
import { LeaseDetailsModal } from "./LeaseDetailsModal";
import { useToast } from "@/hooks/use-toast";
import { DeleteLeasesDialog } from "./DeleteLeasesDialog";
import { LeaseActions } from "./LeaseActions";
import { Lease } from "./types";

export function LeaseSummary() {
  // State for selected leases and the single selected lease
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

  // Update selectedLease whenever selectedLeases changes
  useEffect(() => {
    if (selectedLeases.length === 1 && leases) {
      const lease = leases.find(lease => lease.id === selectedLeases[0]);
      if (lease) {
        console.log("Setting selected lease in LeaseSummary:", lease);
        setSelectedLease(lease);
      }
    } else if (selectedLeases.length === 0 || selectedLeases.length > 1) {
      // Clear selected lease if no leases are selected or multiple are selected
      setSelectedLease(null);
    }
  }, [selectedLeases, leases]);

  // Apply filters to leases
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
  };

  // Handle selection change from the grid
  const handleSelectionChange = (id: string, isSelected: boolean) => {
    console.log(`Selection change for lease ${id}: ${isSelected}`);
    
    if (isSelected) {
      // Single selection mode - replace any existing selection
      setSelectedLeases([id]);
      
      // Find and set the selected lease object
      if (leases) {
        const selectedLeaseObject = leases.find(lease => lease.id === id);
        if (selectedLeaseObject) {
          console.log("Found selected lease:", selectedLeaseObject);
          setSelectedLease(selectedLeaseObject);
        }
      }
    } else {
      // Remove from selection
      setSelectedLeases(prev => prev.filter(leaseId => leaseId !== id));
      
      // If this was the selected lease, clear it
      if (selectedLease && selectedLease.id === id) {
        setSelectedLease(null);
      }
    }
  };

  // Handle lease selection from the grid (e.g., row click)
  const handleLeaseSelect = (lease: Lease) => {
    console.log("Lease selected in grid:", lease);
    
    // Set as the only selected lease
    setSelectedLeases([lease.id]);
    setSelectedLease(lease);
  };

  // Handle lease deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('leases')
        .delete()
        .in('id', selectedLeases);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      queryClient.setQueryData(['leases'], (oldData: Lease[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(lease => !selectedLeases.includes(lease.id));
      });

      setSelectedLeases([]);
      setSelectedLease(null);
      
      toast({
        title: "Success",
        description: `${selectedLeases.length} lease(s) deleted successfully`
      });

      await queryClient.invalidateQueries({ queryKey: ['leases'] });

    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete leases",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Callback when a lease is updated
  const handleLeaseUpdated = async () => {
    console.log("Lease updated, refreshing data");
    await refetch();
    
    // Clear selection if there was any
    if (selectedLeases.length > 0) {
      // Keep the selection but update the selected lease data
      if (selectedLeases.length === 1) {
        const updatedLease = (await refetch()).data?.find(lease => lease.id === selectedLeases[0]);
        if (updatedLease) {
          setSelectedLease(updatedLease);
        }
      }
    }
    
    toast({
      title: "Data Refreshed",
      description: "Lease data has been updated successfully"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SearchFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />
        <LeaseActions
          selectedCount={selectedLeases.length}
          selectedLease={selectedLease}
          onExport={handleExport}
          onDelete={() => setShowDeleteDialog(true)}
          onLeaseUpdated={handleLeaseUpdated}
          isDeleting={isDeleting}
        />
      </div>

      <LeaseGrid 
        leases={filteredLeases || []}
        isLoading={isLoading}
        onLeaseSelect={handleLeaseSelect}
        selectedLeases={selectedLeases}
        onSelectionChange={handleSelectionChange}
      />

      <LeaseDetailsModal
        lease={selectedLease}
        onClose={() => setSelectedLease(null)}
      />

      <DeleteLeasesDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        count={selectedLeases.length}
      />
    </div>
  );
}
