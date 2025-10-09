import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminSetup = () => {
  const [email, setEmail] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("setup-admin", {
        body: { email, setupToken },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Admin role has been granted. You can now login at /admin/login",
      });
      
      navigate("/admin/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>
            First-time admin setup. This only works once to create the initial admin user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Email</label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be an already registered user account
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Setup Token</label>
              <Input
                type="password"
                placeholder="Your secret setup token"
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Contact the system administrator for this token
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up..." : "Grant Admin Access"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
