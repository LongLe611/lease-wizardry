
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface AssetClassificationProps {
  onLowValueChange: (value: boolean) => void;
  onAssetCategoryChange?: (category: string) => void;
  initialIsLowValue?: boolean;
  initialAssetCategory?: string | null;
}

export function AssetClassificationSection({ 
  onLowValueChange,
  onAssetCategoryChange,
  initialIsLowValue = false,
  initialAssetCategory = null
}: AssetClassificationProps) {
  const [isLowValue, setIsLowValue] = useState(initialIsLowValue);
  const [assetCategory, setAssetCategory] = useState<string | null>(initialAssetCategory || null);

  // Initialize with initial values
  useEffect(() => {
    setIsLowValue(initialIsLowValue);
  }, [initialIsLowValue]);
  
  // Initialize asset category with initial value
  useEffect(() => {
    setAssetCategory(initialAssetCategory || null);
  }, [initialAssetCategory]);

  const handleLowValueChange = (checked: boolean) => {
    setIsLowValue(checked);
    onLowValueChange(checked);
  };
  
  const handleAssetCategoryChange = (value: string) => {
    setAssetCategory(value);
    if (onAssetCategoryChange) {
      onAssetCategoryChange(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="low-value" className="flex items-center">
            Low-value Asset Exemption
            {isLowValue && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                Exempt from IFRS 16
              </Badge>
            )}
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Assets with a value of less than $5,000 may qualify for the low-value exemption
          </p>
        </div>
        <Switch 
          id="low-value"
          checked={isLowValue}
          onCheckedChange={handleLowValueChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="asset-category">Right-of-use Asset Category</Label>
        <Select 
          value={assetCategory || ''} 
          onValueChange={handleAssetCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="it">IT/Technology</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
