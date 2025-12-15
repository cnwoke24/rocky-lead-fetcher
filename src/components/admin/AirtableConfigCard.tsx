import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Database, RefreshCw, Save, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AirtableField {
  id: string;
  name: string;
  type: string;
  description: string | null;
}

interface AirtableConfigCardProps {
  clinic: {
    id: string;
    name: string;
    airtable_base_id: string;
    airtable_table_name: string;
    airtable_display_fields?: string[];
  };
  onUpdate: () => void;
}

const DEFAULT_FIELDS = [
  "Caller Name",
  "Phone Number", 
  "Email Address",
  "Patient Type",
  "Call Status",
  "Call Summary",
  "Duration Seconds",
  "Needs Callback"
];

export const AirtableConfigCard = ({ clinic, onUpdate }: AirtableConfigCardProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableFields, setAvailableFields] = useState<AirtableField[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>(
    clinic.airtable_display_fields || DEFAULT_FIELDS
  );
  const [baseId, setBaseId] = useState(clinic.airtable_base_id);
  const [tableName, setTableName] = useState(clinic.airtable_table_name);
  const [isEditing, setIsEditing] = useState(false);

  const fetchSchema = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-airtable-schema', {
        body: { baseId, tableName }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setAvailableFields(data.fields);
      toast({
        title: "Schema Loaded",
        description: `Found ${data.fields.length} fields in ${data.tableName}`,
      });
    } catch (error) {
      console.error("Error fetching schema:", error);
      toast({
        title: "Error",
        description: "Failed to fetch Airtable schema",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleField = (fieldName: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldName)
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...selectedFields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newFields.length) return;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setSelectedFields(newFields);
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('clinics')
        .update({
          airtable_base_id: baseId,
          airtable_table_name: tableName,
          airtable_display_fields: selectedFields,
        })
        .eq('id', clinic.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Airtable configuration saved",
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Airtable Configuration
        </CardTitle>
        <CardDescription>
          Configure which Airtable fields display on the user's dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Base ID and Table Name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="base-id">Airtable Base ID</Label>
            <Input
              id="base-id"
              value={baseId}
              onChange={(e) => setBaseId(e.target.value)}
              placeholder="appXXXXXXXXXXXXX"
              disabled={!isEditing}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="table-name">Table Name</Label>
            <Input
              id="table-name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Calls"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Settings
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSchema}
            disabled={isLoading || !baseId || !tableName}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Fetch Fields
          </Button>
        </div>

        {/* Available Fields Selection */}
        {availableFields.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Available Fields</Label>
            <p className="text-sm text-muted-foreground">
              Select fields to display on the dashboard. Check the box to include a field.
            </p>
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {availableFields.map((field) => (
                <div 
                  key={field.id} 
                  className="flex items-center gap-3 p-3 hover:bg-muted/50"
                >
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.name)}
                    onCheckedChange={() => toggleField(field.name)}
                  />
                  <label 
                    htmlFor={field.id} 
                    className="flex-1 text-sm cursor-pointer"
                  >
                    <span className="font-medium">{field.name}</span>
                    <span className="text-muted-foreground ml-2">({field.type})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Fields Order */}
        {selectedFields.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Display Order</Label>
            <p className="text-sm text-muted-foreground">
              Reorder fields using the arrows. Fields will appear in this order on the dashboard.
            </p>
            <div className="border rounded-lg divide-y">
              {selectedFields.map((fieldName, index) => (
                <div 
                  key={fieldName} 
                  className="flex items-center gap-3 p-2 hover:bg-muted/50"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">{fieldName}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                      className="h-7 w-7 p-0"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'down')}
                      disabled={index === selectedFields.length - 1}
                      className="h-7 w-7 p-0"
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleField(fieldName)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={saveConfiguration} 
          disabled={isSaving}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </CardContent>
    </Card>
  );
};
