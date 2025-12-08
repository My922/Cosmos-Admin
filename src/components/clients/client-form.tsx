"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// Client types matching backend enums
const clientTypes = ["individual", "entity", "trust"] as const;
const riskProfiles = ["conservative", "moderate", "balanced", "growth", "aggressive"] as const;
const kycStatuses = ["pending", "in_progress", "approved", "rejected", "expired"] as const;

const clientSchema = z.object({
  client_type: z.enum(clientTypes),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  entity_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  risk_profile: z.enum(riskProfiles).optional(),
  kyc_status: z.enum(kycStatuses).optional(),
  extra_data: z.string().optional(), // JSON as string for now
}).refine((data) => {
  // For individuals, require first_name and last_name
  if (data.client_type === "individual") {
    return data.first_name && data.last_name;
  }
  // For entities and trusts, require entity_name
  return data.entity_name;
}, {
  message: "Individual clients require first and last name; entities require entity name",
  path: ["client_type"],
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  defaultValues?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function ClientForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  mode = "create",
}: ClientFormProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      client_type: "individual",
      first_name: "",
      last_name: "",
      entity_name: "",
      email: "",
      phone: "",
      risk_profile: undefined,
      kyc_status: mode === "create" ? "pending" : undefined,
      extra_data: "",
      ...defaultValues,
    },
  });

  const clientType = form.watch("client_type");

  // Reset form when defaultValues change (e.g., when client data loads for edit mode)
  useEffect(() => {
    if (defaultValues && mode === "edit") {
      form.reset({
        client_type: defaultValues.client_type || "individual",
        first_name: defaultValues.first_name || "",
        last_name: defaultValues.last_name || "",
        entity_name: defaultValues.entity_name || "",
        email: defaultValues.email || "",
        phone: defaultValues.phone || "",
        risk_profile: defaultValues.risk_profile,
        kyc_status: defaultValues.kyc_status,
        extra_data: defaultValues.extra_data || "",
      });
    }
  }, [defaultValues, mode, form]);

  // Reset name fields when client type changes
  useEffect(() => {
    if (mode === "create") {
      if (clientType === "individual") {
        form.setValue("entity_name", "");
      } else {
        form.setValue("first_name", "");
        form.setValue("last_name", "");
      }
    }
  }, [clientType, mode, form]);

  const handleSubmit = async (data: ClientFormData) => {
    // Clean up the data - convert empty strings to undefined/null
    const submitData: Record<string, any> = {
      client_type: data.client_type,
    };

    // Only include non-empty string fields
    if (data.first_name?.trim()) submitData.first_name = data.first_name.trim();
    if (data.last_name?.trim()) submitData.last_name = data.last_name.trim();
    if (data.entity_name?.trim()) submitData.entity_name = data.entity_name.trim();
    if (data.email?.trim()) submitData.email = data.email.trim();
    if (data.phone?.trim()) submitData.phone = data.phone.trim();
    if (data.risk_profile) submitData.risk_profile = data.risk_profile;
    if (data.kyc_status) submitData.kyc_status = data.kyc_status;

    // Parse extra_data if it's a non-empty string
    if (data.extra_data?.trim()) {
      try {
        submitData.extra_data = JSON.parse(data.extra_data);
      } catch {
        // If parsing fails, don't include it
      }
    }
    
    await onSubmit(submitData as ClientFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Client Type */}
        <FormField
          control={form.control}
          name="client_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Type</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={mode === "edit"}
                >
                  <option value="individual">Individual</option>
                  <option value="entity">Entity</option>
                  <option value="trust">Trust</option>
                </select>
              </FormControl>
              <FormDescription>
                Type of client (cannot be changed after creation)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional fields based on client type */}
        {clientType === "individual" ? (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <FormField
            control={form.control}
            name="entity_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entity Name *</FormLabel>
                <FormControl>
                  <Input placeholder="ABC Corporation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="client@example.com" {...field} />
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
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Risk Profile */}
        <FormField
          control={form.control}
          name="risk_profile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Risk Profile</FormLabel>
              <FormControl>
                <select
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value || undefined)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select risk profile...</option>
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="balanced">Balanced</option>
                  <option value="growth">Growth</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </FormControl>
              <FormDescription>
                Investment risk tolerance level
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* KYC Status */}
        <FormField
          control={form.control}
          name="kyc_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KYC Status</FormLabel>
              <FormControl>
                <select
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value || undefined)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
              </FormControl>
              <FormDescription>
                Know Your Customer verification status
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Extra Data (JSON) */}
        <FormField
          control={form.control}
          name="extra_data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Data (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='{"notes": "VIP client", "source": "referral"}'
                  className="font-mono text-xs"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional JSON data for custom fields
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Client" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

