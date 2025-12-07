"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TenantForm, TenantFormValues } from "./tenant-form";
import { useCreateTenant, useUpdateTenant } from "@/hooks/use-api";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  contact_email?: string;
  contact_phone?: string;
}

interface TenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant | null; // If provided, we're in edit mode
}

export function TenantDialog({ open, onOpenChange, tenant }: TenantDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant(tenant?.id ?? "");
  
  const mode = tenant ? "edit" : "create";
  const title = mode === "create" ? "Add New Tenant" : "Edit Tenant";
  const description =
    mode === "create"
      ? "Create a new EAM firm on the platform. They will be able to manage their own clients and users."
      : "Update the tenant's information and settings.";

  const handleSubmit = async (values: TenantFormValues) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createTenant.mutateAsync(values);
      } else {
        // Don't send slug in update (it's immutable)
        const { slug, ...updateValues } = values;
        await updateTenant.mutateAsync(updateValues);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save tenant:", error);
      // Error will be shown by the mutation's error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues: Partial<TenantFormValues> | undefined = tenant
    ? {
        name: tenant.name,
        slug: tenant.slug,
        contact_email: tenant.contact_email ?? "",
        contact_phone: tenant.contact_phone ?? "",
        is_active: tenant.is_active,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <TenantForm
          mode={mode}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}

