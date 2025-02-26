
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaseScheduleDetails } from "@/components/lease/schedule/LeaseScheduleDetails";
import { LeaseSummary } from "@/components/lease/summary/LeaseSummary";
import { DiscountRateManagement } from "@/components/lease/discount-rate/DiscountRateManagement";

export default function LeaseManagement() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Lease Management</h1>
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="summary" className="flex-1">Lease Summary</TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1">Lease Schedule Details</TabsTrigger>
          <TabsTrigger value="discount-rates" className="flex-1">Discount Rates</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <LeaseSummary />
        </TabsContent>
        <TabsContent value="schedule">
          <LeaseScheduleDetails />
        </TabsContent>
        <TabsContent value="discount-rates">
          <DiscountRateManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
