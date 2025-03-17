
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type RateTable = {
  id: string;
  effective_date: string;
  is_current?: boolean;
};

interface RateTableSelectorProps {
  selectedTableId: string | null;
  rateTables: RateTable[] | undefined;
  isLoading: boolean;
  onTableChange: (id: string) => void;
}

export function RateTableSelector({ 
  selectedTableId, 
  rateTables,
  isLoading,
  onTableChange 
}: RateTableSelectorProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label htmlFor="rate-table">Rate Table Version</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="rate-table">Rate Table Version</Label>
      <Select 
        value={selectedTableId || ''} 
        onValueChange={onTableChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select rate table" />
        </SelectTrigger>
        <SelectContent>
          {rateTables?.map((table) => (
            <SelectItem key={table.id} value={table.id}>
              {formatDate(table.effective_date)}
              {table.is_current && " (Current)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
