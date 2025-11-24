import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bot, CheckCircle, DollarSign, FileText, Phone, Power, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [agreement, setAgreement] = useState<any>(null);
  const [agentStatus, setAgentStatus] = useState(false);
  const [agreementContent, setAgreementContent] = useState("");
  const [amount, setAmount] = useState("");
  const [summaries, setSummaries] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [clinic, setClinic] = useState<any>(null);
  const [retellAgentId, setRetellAgentId] = useState("");
  const [isEditingRetell, setIsEditingRetell] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    if (!userId) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      }

      const { data: agreementData, error: agreementError } = await supabase
        .from("agreements")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (agreementError) {
        console.error("Error loading agreement:", agreementError);
      }

      const { data: agentData, error: agentError } = await supabase
        .from("agent_status")
        .select("is_enabled")
        .eq("user_id", userId)
        .single();

      if (agentError) {
        console.error("Error loading agent status:", agentError);
      }

      const { data: summariesData, error: summariesError } = await supabase
        .from("daily_summaries")
        .select("*")
        .eq("user_id", userId)
        .order("summary_date", { ascending: false })
        .limit(5);

      if (summariesError) {
        console.error("Error loading summaries:", summariesError);
      }

      // Load clinic data if user has a clinic_id
      if (profileData?.clinic_id) {
        const { data: clinicData, error: clinicError } = await supabase
          .from("clinics")
          .select("*")
          .eq("id", profileData.clinic_id)
          .single();

        if (clinicError) {
          console.error("Error loading clinic:", clinicError);
        } else {
          setClinic(clinicData);
          setRetellAgentId(clinicData?.retell_agent_id || "");
        }
      }

      // Load onboarding conversation with detailed logging
      console.log("Loading onboarding conversation for user:", userId);
      const { data: convData, error: convError } = await supabase
        .from("onboarding_conversations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (convError) {
        console.error("Error loading conversation:", convError);
        toast({
          title: "Error",
          description: "Failed to load onboarding conversation",
          variant: "destructive",
        });
      } else {
        console.log("Conversation data:", convData);
        setConversation(convData);

        if (convData) {
          console.log("Loading messages for conversation:", convData.id);
          const { data: msgData, error: msgError } = await supabase
            .from("onboarding_messages")
            .select("*")
            .eq("conversation_id", convData.id)
            .order("created_at", { ascending: true });

          if (msgError) {
            console.error("Error loading messages:", msgError);
            toast({
              title: "Error",
              description: "Failed to load conversation messages",
              variant: "destructive",
            });
          } else {
            console.log("Messages loaded:", msgData?.length || 0);
            setMessages(msgData || []);
          }
        } else {
          console.log("No conversation found for user");
          setMessages([]);
        }
      }

      setProfile(profileData);
      setAgreement(agreementData);
      setAgentStatus(agentData?.is_enabled || false);
      setSummaries(summariesData || []);
    } catch (error) {
      console.error("Unexpected error loading user data:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markOnboardingComplete = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update onboarding status",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Onboarding marked as complete" });
    loadUserData();
  };

  const createAgreement = async () => {
    if (!agreementContent || !amount) {
      toast({
        title: "Error",
        description: "Please fill in both agreement content and amount",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("agreements")
      .insert({
        user_id: userId,
        content: agreementContent,
        amount_cents: parseInt(amount) * 100,
        status: "pending",
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create agreement",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Agreement created successfully" });
    setAgreementContent("");
    setAmount("");
    loadUserData();
  };

  const resetAgreementStatus = async () => {
    if (!agreement) return;

    const { error } = await supabase
      .from("agreements")
      .update({ 
        status: "pending", 
        signed_at: null,
        paid_at: null 
      })
      .eq("id", agreement.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reset agreement status",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Agreement status reset to pending" });
    loadUserData();
  };

  const toggleAgent = async () => {
    // If turning ON, validate requirements
    if (!agentStatus) {
      if (!profile?.clinic_id) {
        toast({
          title: "Cannot Enable Agent",
          description: "Please assign a clinic first.",
          variant: "destructive",
        });
        return;
      }

      if (!clinic?.retell_agent_id) {
        toast({
          title: "Cannot Enable Agent",
          description: "Please set a Retell Agent ID before enabling.",
          variant: "destructive",
        });
        return;
      }
    }

    const { error } = await supabase
      .from("agent_status")
      .update({ is_enabled: !agentStatus })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Agent ${!agentStatus ? "enabled" : "disabled"}`,
    });
    setAgentStatus(!agentStatus);
  };

  const updateAgreementAmount = async () => {
    if (!agreement || !editAmount) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const amountInCents = Math.round(parseFloat(editAmount) * 100);
    
    if (isNaN(amountInCents) || amountInCents <= 0) {
      toast({
        title: "Error",
        description: "Amount must be a positive number",
        variant: "destructive",
      });
      return;
    }

    if (agreement.paid_at) {
      toast({
        title: "Error",
        description: "Cannot modify amount for paid agreements",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("agreements")
      .update({ amount_cents: amountInCents })
      .eq("id", agreement.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update agreement amount",
        variant: "destructive",
      });
      return;
    }

    toast({ 
      title: "Success", 
      description: `Amount updated to $${editAmount}` 
    });
    
    setIsEditingAmount(false);
    setEditAmount("");
    loadUserData();
  };

  const startEditingAmount = () => {
    setEditAmount((agreement.amount_cents / 100).toFixed(2));
    setIsEditingAmount(true);
  };

  const cancelEditingAmount = () => {
    setIsEditingAmount(false);
    setEditAmount("");
  };

  const markSetupFeePaid = async () => {
    if (!agreement) {
      toast({
        title: "Error",
        description: "No agreement found",
        variant: "destructive",
      });
      return;
    }

    if (agreement.paid_at) {
      toast({
        title: "Error",
        description: "Setup fee is already marked as paid",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("agreements")
      .update({
        paid_at: new Date().toISOString(),
        status: "paid"
      })
      .eq("id", agreement.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark setup fee as paid",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Setup fee marked as paid"
    });

    loadUserData();
  };

  const createAndAssignClinic = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-clinic", {
        body: { userId, clinicName: profile?.company_name || undefined },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Clinic created and assigned successfully",
      });

      loadUserData();
    } catch (error) {
      console.error("Error creating clinic:", error);
      toast({
        title: "Error",
        description: "Failed to create clinic",
        variant: "destructive",
      });
    }
  };

  const saveRetellAgentId = async () => {
    if (!clinic) {
      toast({
        title: "Error",
        description: "No clinic found",
        variant: "destructive",
      });
      return;
    }

    if (!retellAgentId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Retell Agent ID",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("clinics")
      .update({ retell_agent_id: retellAgentId.trim() })
      .eq("id", clinic.id);

    if (error) {
      console.error("Error updating Retell Agent ID:", error);
      toast({
        title: "Error",
        description: "Failed to save Retell Agent ID",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Retell Agent ID saved successfully",
    });

    setIsEditingRetell(false);
    loadUserData();
  };

  const testCall = async () => {
    if (!profile?.phone) {
      toast({
        title: "Error",
        description: "No phone number on profile",
        variant: "destructive",
      });
      return;
    }

    if (!clinic?.id || !clinic?.retell_agent_id) {
      toast({
        title: "Error",
        description: "Clinic and Retell Agent ID must be configured first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('retell-demo-call', {
        body: { 
          phone: profile.phone,
          userId: userId // This triggers clinic-specific agent + metadata injection
        }
      });

      if (error) throw error;

      toast({
        title: "Call Initiated",
        description: `Test call started to ${profile.phone} using clinic agent ${clinic.retell_agent_id}`,
      });

      console.log('Test call response:', data);
    } catch (error) {
      console.error('Test call failed:', error);
      toast({
        title: "Error",
        description: "Failed to initiate test call",
        variant: "destructive",
      });
    }
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
          <Button variant="ghost" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Profile</CardTitle>
            <CardDescription>Basic information and contact details</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <p className="text-sm text-muted-foreground">{profile?.full_name || "N/A"}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <p className="text-sm text-muted-foreground">{profile?.phone || "N/A"}</p>
            </div>
            <div>
              <Label>Company</Label>
              <p className="text-sm text-muted-foreground">{profile?.company_name || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle className="h-4 w-4" />
                    Onboarding Call
                  </CardTitle>
                </div>
                {profile?.onboarding_completed ? (
                  <Badge className="bg-green-600">Complete</Badge>
                ) : (
                  <Badge variant="secondary">Not Complete</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!profile?.onboarding_completed && (
                <Button size="sm" onClick={markOnboardingComplete}>Mark Complete</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Signed Agreement
                  </CardTitle>
                </div>
                {agreement?.status === "signed" || agreement?.status === "paid" ? (
                  <Badge className="bg-green-600">Complete</Badge>
                ) : (
                  <Badge variant="secondary">Not Complete</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(agreement?.status === "signed" || agreement?.status === "paid") && (
                <Button size="sm" variant="outline" onClick={resetAgreementStatus}>
                  Reset Status
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4" />
                    Setup Fee
                  </CardTitle>
                </div>
                {agreement?.paid_at ? (
                  <Badge className="bg-green-600">Complete</Badge>
                ) : (
                  <Badge variant="secondary">Not Complete</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {agreement && (
                <>
                  {isEditingAmount ? (
                    <div className="space-y-2">
                      <Label htmlFor="edit-amount">Amount (USD)</Label>
                      <Input
                        id="edit-amount"
                        type="number"
                        step="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="0.00"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={updateAgreementAmount}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditingAmount}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Amount: ${(agreement.amount_cents / 100).toFixed(2)}
                        {agreement.paid_at && (
                          <span className="block mt-1">
                            Paid: {new Date(agreement.paid_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                      {!agreement.paid_at && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={startEditingAmount}
                          >
                            Edit Amount
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={markSetupFeePaid}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark as Paid
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {!agreement && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create Agreement
              </CardTitle>
              <CardDescription>Set up a new agreement for this customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agreement">Agreement Content</Label>
                <Textarea
                  id="agreement"
                  value={agreementContent}
                  onChange={(e) => setAgreementContent(e.target.value)}
                  placeholder="Enter agreement terms..."
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <Button onClick={createAgreement}>
                <DollarSign className="h-4 w-4 mr-2" />
                Create Agreement
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Power className="h-5 w-5" />
                  Agent Control
                </CardTitle>
                <CardDescription>Enable or disable the AI agent for this customer</CardDescription>
              </div>
              <Switch checked={agentStatus} onCheckedChange={toggleAgent} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Agent is currently {agentStatus ? "enabled ✓" : "disabled"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Clinic & Agent Settings
            </CardTitle>
            <CardDescription>
              Manage clinic assignment and Retell voice agent configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Clinic Information */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Clinic Information</Label>
              {!profile?.clinic_id ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">No clinic assigned</p>
                  <Button onClick={createAndAssignClinic} size="sm">
                    Create & Assign Clinic
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border p-3 bg-muted/30">
                  <div>
                    <Label className="text-xs text-muted-foreground">Clinic ID</Label>
                    <p className="text-sm font-mono">{profile.clinic_id}</p>
                  </div>
                  {clinic && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground">Clinic Name</Label>
                        <p className="text-sm">{clinic.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Airtable Base ID</Label>
                        <p className="text-sm font-mono text-xs">{clinic.airtable_base_id}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Retell Agent Configuration */}
            {clinic && (
              <div className="space-y-3 pt-3 border-t">
                <Label className="text-base font-semibold">Retell Agent Configuration</Label>
                <div className="space-y-2">
                  <Label htmlFor="retell-agent-id">Retell Agent ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="retell-agent-id"
                      value={retellAgentId}
                      onChange={(e) => setRetellAgentId(e.target.value)}
                      placeholder="agent_abc123..."
                      disabled={!isEditingRetell}
                      className="font-mono text-sm"
                    />
                    {isEditingRetell ? (
                      <>
                        <Button onClick={saveRetellAgentId} size="sm">
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingRetell(false);
                            setRetellAgentId(clinic?.retell_agent_id || "");
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditingRetell(true)}
                        size="sm"
                        variant="outline"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This agent ID will be used for outbound calls. The clinic ID will be automatically included in call metadata for n8n tracking.
                  </p>
                  
                  {/* Test Call Button */}
                  {clinic?.retell_agent_id && (
                    <div className="pt-3 mt-3 border-t">
                      <Button 
                        onClick={testCall}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={!profile?.phone}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {profile?.phone ? `Test Call to ${profile.phone}` : 'Test Call (Phone Required)'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        {profile?.phone 
                          ? 'Initiates a test call using this user\'s clinic agent with metadata injection'
                          : 'Add a phone number to the customer profile to enable test calls'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Daily Summaries</CardTitle>
            <CardDescription>View recent AI agent activity summaries</CardDescription>
          </CardHeader>
          <CardContent>
            {summaries.length > 0 ? (
              <div className="space-y-3">
                {summaries.map((summary) => (
                  <div key={summary.id} className="border rounded-lg p-3">
                    <div className="text-sm font-medium mb-1">
                      {new Date(summary.summary_date).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-muted-foreground">{summary.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No summaries available yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Onboarding Conversation</CardTitle>
            <CardDescription>Chat transcript with Rocky</CardDescription>
          </CardHeader>
          <CardContent>
            {!conversation ? (
              <p className="text-sm text-muted-foreground">No onboarding conversation yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1">
                        {msg.role === "user" ? "Customer" : "Rocky"}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserDetails;
