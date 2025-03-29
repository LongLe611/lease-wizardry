
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Lease } from "../summary/types";
import { LeaseDetailsCard } from "./components/LeaseDetailsCard";
import { LiabilityCalculationTable } from "./components/LiabilityCalculationTable";
import { MonthlyScheduleTable } from "./components/MonthlyScheduleTable";
import { useLeaseSchedule } from "./hooks/useLeaseSchedule";

export function LeaseScheduleDetails() {
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>("");

  const { data: leases, isLoading } = useQuery({
    queryKey: ['leases'],
    queryFn: async () => {
      console.log("LeaseScheduleDetails: Fetching fresh lease data");
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .order('contract_number');
      
      if (error) {
        console.error("Error fetching leases in LeaseScheduleDetails:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("LeaseScheduleDetails received lease data. First lease payment amount:", data[0].base_payment);
      }
      
      return data as Lease[];
    },
    staleTime: 0, // Consider data immediately stale
    refetchOnWindowFocus: true,
    refetchOnMount: true // Always refetch on mount
  });

  useEffect(() => {
    if (leases?.length && !selectedLeaseId) {
      setSelectedLeaseId(leases[0].id);
      console.log("Selected first lease with ID:", leases[0].id, "and payment:", leases[0].base_payment);
    }
  }, [leases, selectedLeaseId]);

  // Find the selected lease with specific debugging
  const selectedLease = leases?.find(lease => lease.id === selectedLeaseId);
  if (selectedLease) {
    console.log("LeaseScheduleDetails - Selected lease details:", {
      id: selectedLease.id,
      basePayment: selectedLease.base_payment,
      assetType: selectedLease.asset_type
    });
  }
  
  const { leaseSchedule, monthlySchedule } = useLeaseSchedule(selectedLease);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Contract Number</Label>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Contract Number</Label>
              <Select 
                value={selectedLeaseId} 
                onValueChange={(value) => {
                  console.log("Lease selection changed to:", value);
                  setSelectedLeaseId(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lease contract" />
                </SelectTrigger>
                <SelectContent>
                  {leases?.map(lease => (
                    <SelectItem key={lease.id} value={lease.id}>
                      {lease.contract_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedLease && <LeaseDetailsCard selectedLease={selectedLease} />}

      {selectedLease && (
        <Tabs defaultValue="calculations" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="calculations" className="flex-1">Liability Calculation</TabsTrigger>
            <TabsTrigger value="schedule" className="flex-1">Monthly Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="calculations">
            <Card>
              <CardContent className="pt-6">
                <LiabilityCalculationTable leaseSchedule={leaseSchedule} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardContent className="pt-6">
                <MonthlyScheduleTable monthlySchedule={monthlySchedule} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
