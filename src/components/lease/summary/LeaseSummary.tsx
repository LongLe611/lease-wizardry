
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LeaseGrid } from "./LeaseGrid";
import { SearchFilters } from "./SearchFilters";
import { LeaseDetailsModal } from "./LeaseDetailsModal";
import { DeleteLeasesDialog } from "./DeleteLeasesDialog";
import { LeaseActions } from "./LeaseActions";
import { Lease } from "./types";
import { useToast } from "@/hooks/use-toast";
import { useLeaseFilters } from "./hooks/useLeaseFilters";
import { useLeaseSelection } from "./hooks/useLeaseSelection";
import { useLeaseDeletion } from "./hooks/useLeaseDeletion";
import { useLeaseData } from "./hooks/useLeaseData";

export function LeaseSummary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { leases, isLoading, refetch } = useLeaseData();
  const { filters, setFilters, applyFilters } = useLeaseFilters();
  const { 
    selectedLease, 
    setSelectedLease, 
    selectedLeases, 
    setSelectedLeases, 
    handleSelectionChange, 
    handleLeaseSelect 
  } = useLeaseSelection(leases);
  
  const { 
    showDeleteDialog, 
    setShowDeleteDialog, 
    isDeleting, 
    handleDelete 
  } = useLeaseDeletion();

  // Force refresh data on mount
  useEffect(() => {
    console.log("LeaseSummary mounted - forcing data refresh");
    queryClient.resetQueries();
    refetch();
  }, [refetch, queryClient]);

  // Get filtered leases from the filter hook
  const filteredLeases = applyFilters(leases);

  // Log lease data for debugging
  useEffect(() => {
    if (leases && leases.length > 0) {
      console.log("LeaseSummary has lease data:", leases.length, "records");
      console.log("First lease payment amount:", leases[0].base_payment);
    }
  }, [leases]);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your PDF is being generated..."
    });
  };

  // Callback when a lease is updated
  const handleLeaseUpdated = async () => {
    console.log("Lease updated, doing complete data refresh");
    
    // Complete cache reset and refetch
    await queryClient.resetQueries();
    const refetchResult = await refetch();
    console.log("Full data refetch completed with result:", refetchResult.data?.length || 0, "records");
    
    // Clear selection if there was any
    if (selectedLeases.length > 0) {
      // Keep the selection but update the selected lease data
      if (selectedLeases.length === 1) {
        const updatedLease = refetchResult.data?.find(lease => lease.id === selectedLeases[0]);
        if (updatedLease) {
          console.log("Updating selected lease with fresh data:", updatedLease);
          setSelectedLease(updatedLease);
        }
      }
    }
    
    toast({
      title: "Data Refreshed",
      description: "Lease data has been updated successfully"
    });
  };

  const onDeleteConfirm = async () => {
    await handleDelete(selectedLeases, () => {
      setSelectedLeases([]);
      setSelectedLease(null);
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
        leases={filteredLeases}
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
        onConfirm={onDeleteConfirm}
        isDeleting={isDeleting}
        count={selectedLeases.length}
      />
    </div>
  );
}
