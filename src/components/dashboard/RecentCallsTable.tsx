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
                      <TableHead>Patient Type</TableHead>
                      <TableHead>Channel</TableHead>
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
                          {format(new Date(call.call_timestamp), "MMM dd, h:mm a")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={call.patient_type === "new" ? "default" : "secondary"}
                            className={
                              call.patient_type === "new"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-primary/10 text-primary"
                            }
                          >
                            {call.patient_type === "new" ? "New" : "Existing"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              call.channel === "email"
                                ? "border-purple-300 text-purple-700"
                                : "border-orange-300 text-orange-700"
                            }
                          >
                            {call.channel === "email" ? "Email" : "SMS"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {call.caller_email || call.caller_phone || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={call.intake_link_sent === "yes" ? "default" : "secondary"}
                            className={
                              call.intake_link_sent === "yes"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : ""
                            }
                          >
                            {call.intake_link_sent === "yes" ? "Sent" : "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {call.call_summary.slice(0, 60)}
                          {call.call_summary.length > 60 && "..."}
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
                format(new Date(selectedCall.call_timestamp), "MMMM dd, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Patient Type</p>
                  <Badge
                    variant={selectedCall.patient_type === "new" ? "default" : "secondary"}
                    className={
                      selectedCall.patient_type === "new"
                        ? "bg-green-100 text-green-700"
                        : "bg-primary/10 text-primary"
                    }
                  >
                    {selectedCall.patient_type === "new" ? "New Patient" : "Existing Patient"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Channel</p>
                  <Badge
                    variant="outline"
                    className={
                      selectedCall.channel === "email"
                        ? "border-purple-300 text-purple-700"
                        : "border-orange-300 text-orange-700"
                    }
                  >
                    {selectedCall.channel === "email" ? "Email" : "SMS"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Contact Information</p>
                <p className="text-sm">
                  {selectedCall.caller_email || selectedCall.caller_phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Intake Link</p>
                <Badge
                  variant={selectedCall.intake_link_sent === "yes" ? "default" : "secondary"}
                  className={
                    selectedCall.intake_link_sent === "yes"
                      ? "bg-green-100 text-green-700"
                      : ""
                  }
                >
                  {selectedCall.intake_link_sent === "yes" ? "Sent" : "Not Sent"}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Call Summary</p>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedCall.call_summary}
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
