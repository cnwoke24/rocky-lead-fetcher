import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";
import { RecentCall } from "@/hooks/useCallData";

interface RecentCallsTableProps {
  data?: RecentCall[];
  displayFields?: string[];
  isLoading: boolean;
  onRefresh?: () => void;
}

// Safe date formatting helper
const formatCallDate = (dateValue: string | undefined, formatStr: string): string => {
  if (!dateValue) return "-";
  try {
    const date = typeof dateValue === "string" ? parseISO(dateValue) : new Date(dateValue);
    if (!isValid(date)) return "-";
    return format(date, formatStr);
  } catch {
    return "-";
  }
};

// Helper function to render field values with appropriate formatting
const renderFieldValue = (call: RecentCall, fieldName: string) => {
  const value = call.fields[fieldName as keyof typeof call.fields];
  
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  
  // Handle special field types
  if (fieldName === "Patient Type") {
    return (
      <Badge
        variant={value === "new" ? "default" : "secondary"}
        className={
          value === "new"
            ? "bg-green-100 text-green-700 hover:bg-green-100"
            : "bg-primary/10 text-primary"
        }
      >
        {value === "new" ? "New" : "Existing"}
      </Badge>
    );
  }
  
  if (fieldName === "Call Status") {
    return (
      <Badge
        variant={value === "Completed" ? "default" : "secondary"}
        className={
          value === "Completed"
            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
            : value === "Open"
            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
            : "bg-gray-100 text-gray-700 hover:bg-gray-100"
        }
      >
        {String(value)}
      </Badge>
    );
  }
  
  if (fieldName === "Intake URL Sent") {
    return (
      <Badge
        variant={value ? "default" : "secondary"}
        className={value ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
      >
        {value ? "Sent" : "-"}
      </Badge>
    );
  }
  
  if (fieldName === "Needs Callback") {
    return (
      <Badge
        variant={value ? "destructive" : "secondary"}
        className={value ? "bg-red-100 text-red-700 hover:bg-red-100" : ""}
      >
        {value ? "Yes" : "No"}
      </Badge>
    );
  }
  
  if (fieldName === "Duration Seconds" && typeof value === "number") {
    return `${Math.floor(value / 60)}m ${value % 60}s`;
  }
  
  if (fieldName === "Call Summary" && typeof value === "string") {
    return value.length > 60 ? `${value.slice(0, 60)}...` : value;
  }
  
  return String(value);
};

const RecentCallsTable = ({ data, displayFields, isLoading, onRefresh }: RecentCallsTableProps) => {
  const [selectedCall, setSelectedCall] = useState<RecentCall | null>(null);
  
  // Default fields if none configured
  const fieldsToDisplay = displayFields || [
    "Caller Name", "Phone Number", "Patient Type", "Call Status", "Call Summary"
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const calls = data || [];

  return (
    <>
      <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Calls</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No recent calls
            </div>
          ) : (
            <div className="rounded-lg border">
              <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      {fieldsToDisplay.map((field) => (
                        <TableHead key={field}>{field}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.map((call) => (
                      <TableRow
                        key={call.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedCall(call)}
                      >
                        <TableCell className="whitespace-nowrap">
                          {formatCallDate(call.fields["Created time"] || call.createdTime, "MMM dd, h:mm a")}
                        </TableCell>
                        {fieldsToDisplay.map((field) => (
                          <TableCell key={field} className="max-w-[150px] truncate">
                            {renderFieldValue(call, field)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>
              {selectedCall && formatCallDate(selectedCall.fields["Created time"] || selectedCall.createdTime, "MMMM dd, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Caller Name</p>
                  <p className="text-sm font-semibold">{selectedCall.fields["Caller Name"] || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Call Status</p>
                  <Badge
                    variant={selectedCall.fields["Call Status"] === "Completed" ? "default" : "secondary"}
                    className={
                      selectedCall.fields["Call Status"] === "Completed"
                        ? "bg-blue-100 text-blue-700"
                        : selectedCall.fields["Call Status"] === "Open"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  >
                    {selectedCall.fields["Call Status"]}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Patient Type</p>
                  <Badge
                    variant={selectedCall.fields["Patient Type"] === "new" ? "default" : "secondary"}
                    className={
                      selectedCall.fields["Patient Type"] === "new"
                        ? "bg-green-100 text-green-700"
                        : "bg-primary/10 text-primary"
                    }
                  >
                    {selectedCall.fields["Patient Type"] === "new" ? "New Patient" : "Existing Patient"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Duration</p>
                  <p className="text-sm font-semibold">
                    {selectedCall.fields["Duration Seconds"] 
                      ? `${Math.floor(selectedCall.fields["Duration Seconds"] / 60)}m ${selectedCall.fields["Duration Seconds"] % 60}s`
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                  <p className="text-sm">{selectedCall.fields["Phone Number"] || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p className="text-sm">{selectedCall.fields["Email Address"] || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Intake Link</p>
                  <Badge
                    variant={selectedCall.fields["Intake URL Sent"] ? "default" : "secondary"}
                    className={
                      selectedCall.fields["Intake URL Sent"]
                        ? "bg-green-100 text-green-700"
                        : ""
                    }
                  >
                    {selectedCall.fields["Intake URL Sent"] ? "Sent" : "Not Sent"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Needs Callback</p>
                  <Badge
                    variant={selectedCall.fields["Needs Callback"] ? "destructive" : "secondary"}
                    className={
                      selectedCall.fields["Needs Callback"]
                        ? "bg-red-100 text-red-700"
                        : ""
                    }
                  >
                    {selectedCall.fields["Needs Callback"] ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Call Summary</p>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedCall.fields["Call Summary"] || "No summary available"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentCallsTable;
