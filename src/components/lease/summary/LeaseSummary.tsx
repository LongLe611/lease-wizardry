import { useState, useEffect, useCallback } from "react";
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
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LeaseSummary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { leases, isLoading, refetch, error, lastRefreshTime } = useLeaseData();
  const { filters, setFilters, applyFilters } = useLeaseFilters();
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Force refresh data on mount with aggressive cache clearing
  useEffect(() => {
    console.log("LeaseSummary mounted - forcing data refresh");
    const refreshData = async () => {
      try {
        await queryClient.resetQueries();
        await refetch();
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    };
    refreshData();
  }, [refetch, queryClient]);

  // Get filtered leases from the filter hook
  const filteredLeases = applyFilters(leases);

  // Log lease data for debugging
  useEffect(() => {
    if (leases && leases.length > 0) {
      console.log("LeaseSummary has lease data:", leases.length, "records");
      console.log("First lease payment amount:", leases[0].base_payment);
      console.log("Data last refreshed at:", lastRefreshTime);
    }
  }, [leases, lastRefreshTime]);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your PDF is being generated..."
    });
  };

  // Manual refresh function with loading state
  const handleManualRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      console.log("Manual refresh requested");
      
      // Reset cache completely
      await queryClient.resetQueries();
      
      // Refetch with fresh data
      const result = await refetch();
      
      toast({
        title: "Data Refreshed",
        description: `Successfully loaded ${result.data?.length || 0} leases`
      });
      
      // Update selection if needed
      if (selectedLease && result.data) {
        const updatedLease = result.data.find(lease => lease.id === selectedLease.id);
        if (updatedLease) {
          setSelectedLease(updatedLease);
        }
      }
    } catch (err: any) {
      toast({
        title: "Refresh Failed",
        description: err.message || "Could not refresh lease data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, refetch, selectedLease, setSelectedLease, toast]);

  // Callback when a lease is updated
  const handleLeaseUpdated = async () => {
    console.log("Lease updated, doing complete data refresh");
    
    try {
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
    } catch (error: any) {
      console.error("Error refreshing data after lease update:", error);
      toast({
        title: "Refresh Error",
        description: error.message || "Failed to refresh data after update",
        variant: "destructive"
      });
    }
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
          <LeaseActions
            selectedCount={selectedLeases.length}
            selectedLease={selectedLease}
            onExport={handleExport}
            onDelete={() => setShowDeleteDialog(true)}
            onLeaseUpdated={handleLeaseUpdated}
            isDeleting={isDeleting}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading lease data</h3>
            <p className="text-sm text-red-700 mt-1">{error instanceof Error ? error.message : "Unknown error"}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 bg-white text-red-600 border-red-300 hover:bg-red-50"
              onClick={handleManualRefresh}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      <LeaseGrid 
        leases={filteredLeases}
        isLoading={isLoading || isRefreshing}
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
