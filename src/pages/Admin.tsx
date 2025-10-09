import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bot, LogOut, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  company_name: string;
  onboarding_completed: boolean;
  has_agreement: boolean;
  agreement_signed: boolean;
  agent_enabled: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
    loadUsers();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      toast({
        title: "Access Denied",
        description: "You don't have admin access",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        phone,
        company_name,
        onboarding_completed
      `);

    if (!profiles) return;

    const usersWithDetails = await Promise.all(
      profiles.map(async (profile) => {
        const { data: agreement } = await supabase
          .from("agreements")
          .select("status")
          .eq("user_id", profile.id)
          .single();

        const { data: agentStatus } = await supabase
          .from("agent_status")
          .select("is_enabled")
          .eq("user_id", profile.id)
          .single();

        return {
          ...profile,
          has_agreement: !!agreement,
          agreement_signed: agreement?.status === "signed" || agreement?.status === "paid",
          agent_enabled: agentStatus?.is_enabled || false,
        };
      })
    );

    setUsers(usersWithDetails);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const viewUserDetails = (userId: string) => {
    navigate(`/admin/user/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 grid place-items-center rounded-xl bg-primary/10">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground leading-none">Rocky AI</div>
              <div className="text-base font-semibold leading-none">Admin Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full">
              <LogOut className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=Admin" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Accounts
                </CardTitle>
                <CardDescription>Manage all customer accounts and their status</CardDescription>
              </div>
              <Badge variant="secondary">{users.length} Users</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Agreement</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.company_name || "N/A"}</TableCell>
                    <TableCell>
                      {user.onboarding_completed ? (
                        <Badge className="bg-green-600">Complete</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.agreement_signed ? (
                        <Badge className="bg-green-600">Signed</Badge>
                      ) : user.has_agreement ? (
                        <Badge variant="secondary">Pending</Badge>
                      ) : (
                        <Badge variant="outline">None</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.agent_enabled ? (
                        <Badge className="bg-blue-600">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => viewUserDetails(user.id)}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
