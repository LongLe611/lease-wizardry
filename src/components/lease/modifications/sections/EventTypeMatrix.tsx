
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function EventTypeMatrix() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="modification-type">Modification Type</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="extension">Lease Extension</SelectItem>
            <SelectItem value="termination">Early Termination</SelectItem>
            <SelectItem value="price">Price Change</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="effective-date">Effective Date</Label>
          <Input
            id="effective-date"
            type="date"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recognition-date">Recognition Date</Label>
          <Input
            id="recognition-date"
            type="date"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
