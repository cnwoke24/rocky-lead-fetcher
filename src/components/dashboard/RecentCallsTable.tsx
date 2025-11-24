import { useState } from "react";
import { format } from "date-fns";
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
  isLoading: boolean;
  onRefresh?: () => void;
}

const RecentCallsTable = ({ data, isLoading, onRefresh }: RecentCallsTableProps) => {
  const [selectedCall, setSelectedCall] = useState<RecentCall | null>(null);

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
                      <TableHead>Caller</TableHead>
                      <TableHead>Patient Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Intake Link</TableHead>
                      <TableHead>Summary</TableHead>
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
                          {format(new Date(call.fields["Created time"]), "MMM dd, h:mm a")}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {call.fields["Caller Name"] || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={call.fields["Patient Type"] === "new" ? "default" : "secondary"}
                            className={
                              call.fields["Patient Type"] === "new"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-primary/10 text-primary"
                            }
                          >
                            {call.fields["Patient Type"] === "new" ? "New" : "Existing"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={call.fields["Call Status"] === "Completed" ? "default" : "secondary"}
                            className={
                              call.fields["Call Status"] === "Completed"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : call.fields["Call Status"] === "Open"
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                            }
                          >
                            {call.fields["Call Status"]}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {call.fields["Email Address"] || call.fields["Phone Number"] || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={call.fields["Intake URL Sent"] ? "default" : "secondary"}
                            className={
                              call.fields["Intake URL Sent"]
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : ""
                            }
                          >
                            {call.fields["Intake URL Sent"] ? "Sent" : "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {call.fields["Call Summary"]?.slice(0, 60) || "-"}
                          {(call.fields["Call Summary"]?.length || 0) > 60 && "..."}
                        </TableCell>
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
              {selectedCall &&
                format(new Date(selectedCall.fields["Created time"]), "MMMM dd, yyyy 'at' h:mm a")}
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
