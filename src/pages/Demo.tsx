import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2 } from "lucide-react";
import rockyLogo from "@/assets/rocky-logo.png";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    return digits.length === 10;
  }, "Please enter a valid 10-digit phone number"),
  serviceType: z.string().min(1, "Service type is required"),
  date: z.string().min(1, "Date is required"),
  budget: z.string().min(1, "Budget is required"),
  notes: z.string().max(1000).optional(),
  barberPhone: z.string().refine((val) => {
    if (!val) return true;
    const digits = val.replace(/\D/g, "");
    return digits.length === 10;
  }, "Please enter a valid 10-digit phone number").optional(),
});

type FormData = z.infer<typeof formSchema>;

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const serviceTypes = [
  "DJ Services",
  "Live Band",
  "Event Planning",
  "Sound Equipment",
  "Lighting",
  "Photography",
  "Videography",
  "Other",
];

const budgetRanges = [
  "Under $500",
  "$500 - $1,000",
  "$1,000 - $2,500",
  "$2,500 - $5,000",
  "$5,000 - $10,000",
  "$10,000+",
];

const Demo = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      serviceType: "",
      date: "",
      budget: "",
      notes: "",
      barberPhone: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "submit-demo-lead",
        {
          body: data,
        }
      );

      if (fnError) {
        throw new Error(fnError.message || "Failed to submit");
      }

      if (!result?.success) {
        throw new Error(result?.error || "Failed to submit");
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">
              We've received your request and will be in touch shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={rockyLogo} alt="Rocky" className="h-12 mx-auto mb-4" />
          <CardTitle className="text-2xl">Request a Demo</CardTitle>
          <CardDescription>
            Fill out the form below and we'll get back to you shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="(555) 555-5555"
                        {...field}
                        onChange={(e) => {
                          field.onChange(formatPhoneNumber(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fade, Men's Cornrows" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your budget" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgetRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about your event..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-4" />

              <FormField
                control={form.control}
                name="barberPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barber Contact Number (to receive the demo call)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="(555) 555-5555"
                        {...field}
                        onChange={(e) => {
                          field.onChange(formatPhoneNumber(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Start Demo"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Demo;
