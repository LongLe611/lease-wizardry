
import { Button } from "@/components/ui/button";
import { FileDown, Trash2, PencilLine, Plus } from "lucide-react";
import { NewLeaseDialog } from "../new-lease/NewLeaseDialog";
import { EditLeaseDialog } from "../edit-lease/EditLeaseDialog";
import { useState } from "react";
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
        onClick={() => setIsEditDialogOpen(true)}
        disabled={selectedCount !== 1 || !selectedLease}
      >
        <PencilLine className="mr-2 h-4 w-4" />
        Edit Lease
      </Button>
      <NewLeaseDialog />
      
      <EditLeaseDialog 
        lease={selectedLease}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onLeaseUpdated={onLeaseUpdated}
      />
    </div>
  );
}
