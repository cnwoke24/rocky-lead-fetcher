import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CallStats {
  totalCallsToday: number;
  newPatientsToday: number;
  existingPatientsToday: number;
  intakeLinksSent: number;
  callbacksNeeded: number;
  weeklyData: { date: string; count: number }[];
}

export interface RecentCall {
  id: string;
  createdTime?: string;
  fields: {
    "Created time"?: string;
    "Caller Name"?: string;
    "Phone Number"?: string;
    "Email Address"?: string;
    "Patient Type"?: "new" | "existing";
    "Call Summary"?: string;
    "Intake URL Sent"?: string;
    "Call Status"?: "Completed" | "Open" | "No Response";
    "Duration Seconds"?: number;
    "Needs Callback"?: boolean;
    [key: string]: unknown;
  };
}

export const useCallStats = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["call-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<CallStats>("get-call-stats");

      if (error) {
        toast({
          title: "Error Loading Stats",
          description: error.message || "Failed to fetch call statistics",
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    retry: 2,
  });
};

export const useRecentCalls = (limit: number = 20) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["recent-calls", limit],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<{ 
        calls: RecentCall[]; 
        displayFields?: string[];
      }>("get-recent-calls", {
        body: { limit },
      });

      if (error) {
        toast({
          title: "Error Loading Calls",
          description: error.message || "Failed to fetch recent calls",
          variant: "destructive",
        });
        throw error;
      }

      return {
        calls: data?.calls || [],
        displayFields: data?.displayFields || [
          "Caller Name", "Phone Number", "Email Address", "Patient Type", 
          "Call Status", "Call Summary", "Duration Seconds", "Needs Callback"
        ],
      };
    },
    retry: 2,
  });
};
