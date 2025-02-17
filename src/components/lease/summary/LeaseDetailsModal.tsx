
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface LeaseDetailsModalProps {
  lease: any | null;
  onClose: () => void;
}

export function LeaseDetailsModal({ lease, onClose }: LeaseDetailsModalProps) {
  if (!lease) return null;

  return (
    <Dialog open={!!lease} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Lease Details - {lease.lessor_entity}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="schedule" className="flex-1">Payment Schedule</TabsTrigger>
            <TabsTrigger value="modifications" className="flex-1">Modifications</TabsTrigger>
            <TabsTrigger value="accounting" className="flex-1">Accounting</TabsTrigger>
            <TabsTrigger value="audit" className="flex-1">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Payment Details</h3>
              <p>Base Payment: ${lease.base_payment}</p>
              <p>Payment Interval: {lease.payment_interval}</p>
              <p>Start Date: {format(new Date(lease.commencement_date), "PP")}</p>
              <p>End Date: {format(new Date(lease.expiration_date), "PP")}</p>
            </div>
          </TabsContent>

          <TabsContent value="modifications">
            <p>No modifications recorded</p>
          </TabsContent>

          <TabsContent value="accounting">
            <p>No accounting entries available</p>
          </TabsContent>

          <TabsContent value="audit">
            <div className="space-y-2">
              <p>Created: {format(new Date(lease.created_at), "Pp")}</p>
              <p>Last Modified: {format(new Date(lease.updated_at), "Pp")}</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
