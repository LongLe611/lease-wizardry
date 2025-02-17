
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

export function ContractDetailsSection() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="lessor">Lessor Legal Entity</Label>
        <div className="relative">
          <Input
            id="lessor"
            placeholder="Search lessor..."
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="commencement">Commencement Date</Label>
          <div className="relative">
            <Input
              id="commencement"
              type="date"
              className="w-full"
            />
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiration">Expiration Date</Label>
          <div className="relative">
            <Input
              id="expiration"
              type="date"
              className="w-full"
            />
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="term">Lease Term (Years)</Label>
        <Input
          id="term"
          type="number"
          min="0"
          step="1"
          placeholder="Calculated lease term..."
          className="w-full"
          readOnly
        />
      </div>
    </div>
  );
}
