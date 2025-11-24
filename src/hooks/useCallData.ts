import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CallStats {
  totalCallsToday: number;
  newPatientsToday: number;
  existingPatientsToday: number;
  intakeLinksSent: number;
  emailPercentage: number;
  weeklyData: { date: string; count: number }[];
}

export interface RecentCall {
  id: string;
  call_timestamp: string;
  patient_type: "new" | "existing";
  channel: "email" | "sms";
  caller_phone?: string;
  caller_email?: string;
  intake_link_sent: string;
  call_summary: string;
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
      const { data, error } = await supabase.functions.invoke<RecentCall[]>("get-recent-calls", {
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

      return data;
    },
    retry: 2,
  });
};
