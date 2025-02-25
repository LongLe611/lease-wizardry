
import { Button } from "@/components/ui/button";
import { FileDown, Trash2 } from "lucide-react";
import { NewLeaseDialog } from "../new-lease/NewLeaseDialog";

interface LeaseActionsProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function LeaseActions({
  selectedCount,
  onExport,
  onDelete,
  isDeleting
}: LeaseActionsProps) {
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
      <NewLeaseDialog />
    </div>
  );
}
