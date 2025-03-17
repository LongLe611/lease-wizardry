
import { useState, useEffect } from "react";
import { Lease } from "../types";

export function useLeaseSelection(leases: Lease[] | undefined) {
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [selectedLeases, setSelectedLeases] = useState<string[]>([]);

  // Update selectedLease whenever selectedLeases changes
  useEffect(() => {
    if (selectedLeases.length === 1 && leases) {
      const lease = leases.find(lease => lease.id === selectedLeases[0]);
      if (lease) {
        console.log("Setting selected lease in useLeaseSelection:", lease);
        setSelectedLease(lease);
      }
    } else if (selectedLeases.length === 0 || selectedLeases.length > 1) {
      // Clear selected lease if no leases are selected or multiple are selected
      setSelectedLease(null);
    }
  }, [selectedLeases, leases]);

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

  return {
    selectedLease,
    setSelectedLease,
    selectedLeases,
    setSelectedLeases,
    handleSelectionChange,
    handleLeaseSelect
  };
}
