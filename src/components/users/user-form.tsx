"use client";

import { useState } from "react";
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
import { Loader2, Eye, EyeOff } from "lucide-react";

// Base validation schema
const userFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters"),
  password: z.string().optional(),
  is_active: z.boolean().default(true),
  tenant_id: z.string().optional(),
  role_ids: z.array(z.string()).optional(),
});

// Create mode requires password
const createUserSchema = userFormSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
});

// Edit mode password is optional
const editUserSchema = userFormSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .optional()
    .or(z.literal("")),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface UserFormProps {
  defaultValues?: Partial<UserFormValues>;
  onSubmit: (values: UserFormValues) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
  tenants?: Tenant[];
  roles?: Role[];
  showTenantSelector?: boolean;
  showRoleSelector?: boolean;
  currentTenantId?: string;
}

export function UserForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  mode,
  tenants = [],
  roles = [],
  showTenantSelector = false,
  showRoleSelector = false,
  currentTenantId,
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const schema = mode === "create" ? createUserSchema : editUserSchema;
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      is_active: true,
      // For super admin creating users, don't pre-select a tenant
      tenant_id: showTenantSelector ? "" : currentTenantId,
      role_ids: [],
      ...defaultValues,
    },
  });

  const handleSubmit = async (values: UserFormValues) => {
    // Clean up empty password for edit mode
    const cleanedValues = {
      ...values,
      password: values.password || undefined,
      // Use selected tenant_id, or fall back to current user's tenant only if not showing selector
      tenant_id: showTenantSelector ? values.tenant_id : currentTenantId,
    };
    await onSubmit(cleanedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John"
                    {...field}
                    disabled={isLoading}
                  />
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
                  <Input
                    placeholder="Doe"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Used for login and notifications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password {mode === "create" ? "*" : "(leave blank to keep current)"}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "create" ? "Min 8 characters" : "••••••••"}
                    {...field}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showTenantSelector && tenants.length > 0 && (
          <FormField
            control={form.control}
            name="tenant_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenant / Organization *</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={isLoading || mode === "edit"}
                  >
                    <option value="">Select a tenant</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormDescription>
                  {mode === "edit"
                    ? "Tenant cannot be changed after creation"
                    : "Which EAM firm this user belongs to"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {showRoleSelector && roles.length > 0 && (
          <FormField
            control={form.control}
            name="role_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Roles</FormLabel>
                <div className="space-y-2 rounded-lg border p-4">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={`role-${role.id}`}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                        checked={field.value?.includes(role.id) || false}
                        onChange={(e) => {
                          const currentRoles = field.value || [];
                          if (e.target.checked) {
                            field.onChange([...currentRoles, role.id]);
                          } else {
                            field.onChange(currentRoles.filter((id) => id !== role.id));
                          }
                        }}
                        disabled={isLoading}
                      />
                      <label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm">{role.name}</div>
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      </label>
                    </div>
                  ))}
                </div>
                <FormDescription>
                  Select one or more roles for this user
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {mode === "edit" && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <FormDescription>
                    Inactive users cannot log in
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
            {mode === "create" ? "Create User" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

