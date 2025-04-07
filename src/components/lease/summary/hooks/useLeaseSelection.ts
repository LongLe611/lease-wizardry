
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

  // Handle selection change from the grid (ONLY updates checkbox state)
  const handleSelectionChange = (id: string, isSelected: boolean) => {
    console.log(`Selection change for lease ${id}: ${isSelected}`);
    
    if (isSelected) {
      setSelectedLeases(prev => {
        // Add to the selection if not already selected
        if (!prev.includes(id)) {
          return [...prev, id];
        }
        return prev;
      });
    } else {
      // Remove from selection
      setSelectedLeases(prev => prev.filter(leaseId => leaseId !== id));
    }
  };

  // Handle lease selection from the grid (ONLY opens details popup)
  const handleLeaseSelect = (lease: Lease) => {
    console.log("Lease selected for details view:", lease);
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
