
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  filters: {
    searchText: string;
    activeOnly: boolean;
    modifiedOnly: boolean;
    lowValueOnly: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leases..."
          value={filters.searchText}
          onChange={(e) => handleFilterChange("searchText", e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex space-x-6">
        <div className="flex items-center space-x-2">
          <Switch
            checked={filters.activeOnly}
            onCheckedChange={(checked) => handleFilterChange("activeOnly", checked)}
          />
          <Label>Active Only</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={filters.modifiedOnly}
            onCheckedChange={(checked) => handleFilterChange("modifiedOnly", checked)}
          />
          <Label>Modified</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={filters.lowValueOnly}
            onCheckedChange={(checked) => handleFilterChange("lowValueOnly", checked)}
          />
          <Label>Low Value</Label>
        </div>
      </div>
    </div>
  );
}
