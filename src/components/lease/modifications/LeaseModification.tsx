
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventTypeMatrix } from "./sections/EventTypeMatrix";
import { ImpactCalculator } from "./sections/ImpactCalculator";
import { DocumentationHub } from "./sections/DocumentationHub";

export function LeaseModification() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Type Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <EventTypeMatrix />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Impact Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <ImpactCalculator />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentation Hub</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentationHub />
        </CardContent>
      </Card>
    </div>
  );
}
