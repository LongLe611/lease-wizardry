
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaseScheduleDetails } from "@/components/lease/schedule/LeaseScheduleDetails";
import { LeaseSummary } from "@/components/lease/summary/LeaseSummary";

export default function LeaseManagement() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Lease Management</h1>
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="summary" className="flex-1">Lease Summary</TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1">Lease Schedule Details</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <LeaseSummary />
        </TabsContent>
        <TabsContent value="schedule">
          <LeaseScheduleDetails />
        </TabsContent>
      </Tabs>
    </div>
  );
}
