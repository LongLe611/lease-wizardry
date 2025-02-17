
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AssetClassificationSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="low-value" />
        <Label htmlFor="low-value">Low-value Asset Exemption</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="embedded-lease" />
        <Label htmlFor="embedded-lease">Contains Embedded Lease</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="asset-category">Right-of-use Asset Category</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
