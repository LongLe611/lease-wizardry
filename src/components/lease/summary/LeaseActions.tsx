
import { Button } from "@/components/ui/button";
import { FileDown, Trash2, PencilLine } from "lucide-react";
import { NewLeaseDialog } from "../new-lease/NewLeaseDialog";
import { EditLeaseDialog } from "../edit-lease/EditLeaseDialog";
import { useState, useEffect } from "react";
import { Lease } from "./types";

interface LeaseActionsProps {
  selectedCount: number;
  selectedLease: Lease | null;
  onExport: () => void;
  onDelete: () => void;
  onLeaseUpdated: () => void;
  isDeleting: boolean;
}

export function LeaseActions({
  selectedCount,
  selectedLease,
  onExport,
  onDelete,
  onLeaseUpdated,
  isDeleting
}: LeaseActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Store the selected lease in a local state to prevent losing it during re-renders
  const [currentSelectedLease, setCurrentSelectedLease] = useState<Lease | null>(null);

  // Update the current selected lease when the selectedLease prop changes
  useEffect(() => {
    console.log("Selected lease in LeaseActions updated:", selectedLease);
    if (selectedLease) {
      setCurrentSelectedLease(selectedLease);
    }
  }, [selectedLease]);

  const handleEditClick = () => {
    console.log("Edit button clicked, selected lease:", selectedLease || currentSelectedLease);
    
    // Use the most recent lease data available (either from props or local state)
    const leaseToEdit = selectedLease || currentSelectedLease;
    
    if (leaseToEdit) {
      // Make sure we have the latest selected lease data
      setCurrentSelectedLease(leaseToEdit);
      setIsEditDialogOpen(true);
    } else {
      console.error("No lease available for editing");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {selectedCount > 0 && (
        <span className="text-sm text-muted-foreground">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
      )}
      <Button onClick={onExport}>
        <FileDown className="mr-2 h-4 w-4" />
        Export to PDF
      </Button>
      <Button
        variant="destructive"
        onClick={onDelete}
        disabled={selectedCount === 0 || isDeleting}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Lease{selectedCount !== 1 ? 's' : ''}
      </Button>
      <Button
        variant="outline"
        onClick={handleEditClick}
        disabled={selectedCount !== 1}
      >
        <PencilLine className="mr-2 h-4 w-4" />
        Edit Lease
      </Button>
      <NewLeaseDialog />
      
      {/* Always render the EditLeaseDialog to maintain consistent state */}
      <EditLeaseDialog 
        lease={currentSelectedLease}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onLeaseUpdated={onLeaseUpdated}
      />
    </div>
  );
}
