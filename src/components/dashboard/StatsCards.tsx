import { Phone, UserPlus, Users, Link, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CallStats } from "@/hooks/useCallData";

interface StatsCardsProps {
  data?: CallStats;
  isLoading: boolean;
}

const StatsCards = ({ data, isLoading }: StatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Calls Today",
      value: data?.totalCallsToday || 0,
      icon: Phone,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "New Patients",
      value: data?.newPatientsToday || 0,
      icon: UserPlus,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Existing Patients",
      value: data?.existingPatientsToday || 0,
      icon: Users,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Intake Links Sent",
      value: data?.intakeLinksSent || 0,
      icon: Link,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "Email Engagement",
      value: `${data?.emailPercentage || 0}%`,
      icon: Mail,
      bgColor: "bg-teal-100",
      iconColor: "text-teal-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border-border hover:shadow-md transition-shadow animate-scale-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
