
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
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .order('contract_number');
      
      if (error) throw error;
      return data as Lease[];
    }
  });

  useEffect(() => {
    if (leases?.length && !selectedLeaseId) {
      setSelectedLeaseId(leases[0].id);
    }
  }, [leases, selectedLeaseId]);

  const selectedLease = leases?.find(lease => lease.id === selectedLeaseId);
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
              <Select value={selectedLeaseId} onValueChange={setSelectedLeaseId}>
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
