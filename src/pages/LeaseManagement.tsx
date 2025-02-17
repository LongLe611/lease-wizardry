
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewLeaseForm } from "@/components/lease/new-lease/NewLeaseForm";
import { LeaseModification } from "@/components/lease/modifications/LeaseModification";
import { LeaseSummary } from "@/components/lease/summary/LeaseSummary";

export default function LeaseManagement() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Lease Management</h1>
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="summary" className="w-1/3">Lease Summary</TabsTrigger>
          <TabsTrigger value="new-lease" className="w-1/3">New Lease Creation</TabsTrigger>
          <TabsTrigger value="modifications" className="w-1/3">Lease Modifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <LeaseSummary />
        </TabsContent>
        
        <TabsContent value="new-lease">
          <NewLeaseForm />
        </TabsContent>
        
        <TabsContent value="modifications">
          <LeaseModification />
        </TabsContent>
      </Tabs>
    </div>
  );
}
