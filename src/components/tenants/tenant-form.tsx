"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Validation schema
const tenantFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  contact_email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  contact_phone: z
    .string()
    .max(20, "Phone number too long")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;

interface TenantFormProps {
  defaultValues?: Partial<TenantFormValues>;
  onSubmit: (values: TenantFormValues) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function TenantForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  mode,
}: TenantFormProps) {
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      contact_email: "",
      contact_phone: "",
      is_active: true,
      ...defaultValues,
    },
  });

  // Auto-generate slug from name (only in create mode)
  const watchName = form.watch("name");
  useEffect(() => {
    if (mode === "create" && watchName) {
      const currentSlug = form.getValues("slug");
      const generatedSlug = generateSlug(watchName);
      // Only auto-update if user hasn't manually edited the slug
      if (!currentSlug || currentSlug === generateSlug(form.getValues("name").slice(0, -1))) {
        form.setValue("slug", generatedSlug);
      }
    }
  }, [watchName, mode, form]);

  const handleSubmit = async (values: TenantFormValues) => {
    // Clean up empty strings to undefined for optional fields
    const cleanedValues = {
      ...values,
      contact_email: values.contact_email || undefined,
      contact_phone: values.contact_phone || undefined,
    };
    await onSubmit(cleanedValues as TenantFormValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Acme Wealth Management"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                The official name of the EAM firm
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug *</FormLabel>
              <FormControl>
                <Input
                  placeholder="acme-wealth"
                  {...field}
                  disabled={isLoading || mode === "edit"}
                />
              </FormControl>
              <FormDescription>
                {mode === "edit"
                  ? "Slug cannot be changed after creation"
                  : "Used in URLs and API calls (auto-generated from name)"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="admin@acme-wealth.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Primary contact email for this tenant
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Phone</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Primary contact phone number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "edit" && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <FormDescription>
                    Inactive tenants cannot access the platform
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Tenant" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

