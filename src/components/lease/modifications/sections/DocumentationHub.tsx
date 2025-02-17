
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

export function DocumentationHub() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="modification-reason">Modification Reason</Label>
        <Textarea
          id="modification-reason"
          placeholder="Enter detailed reason for modification..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="document-upload">Supporting Documents</Label>
        <div className="flex items-center gap-4">
          <Input
            id="document-upload"
            type="file"
            className="w-full"
            multiple
          />
          <Button type="button">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Save Draft</Button>
        <Button>Submit for Approval</Button>
      </div>
    </div>
  );
}
