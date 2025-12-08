"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from "./client-form";
import { useCreateClient, useUpdateClient } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  client_type: "individual" | "entity" | "trust";
  first_name?: string;
  last_name?: string;
  entity_name?: string;
  email?: string;
  phone?: string;
  risk_profile?: string;
  kyc_status?: string;
  extra_data?: any;
}

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export function ClientDialog({ open, onOpenChange, client }: ClientDialogProps) {
  const createMutation = useCreateClient();
  // Always call hooks unconditionally - use empty string as fallback ID
  const updateMutation = useUpdateClient(client?.id || "");
  const { toast } = useToast();

  const isEdit = !!client;

  // Reset mutations when dialog closes
  useEffect(() => {
    if (!open) {
      createMutation.reset();
      updateMutation.reset();
    }
  }, [open, createMutation, updateMutation]);

  const handleSubmit = async (data: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
        toast({
          title: "Client updated",
          description: "Client information has been updated successfully.",
        });
      } else {
        await createMutation.mutateAsync(data);
        toast({
          title: "Client created",
          description: "New client has been created successfully.",
        });
      }
      onOpenChange(false);
    } catch (error: any) {
      // Extract error message properly
      let errorMessage = "Failed to save client. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.detail) {
        errorMessage = typeof error.detail === "string" 
          ? error.detail 
          : JSON.stringify(error.detail);
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const isLoading = isEdit ? updateMutation.isPending : createMutation.isPending;
  const mutationError = isEdit ? updateMutation.error : createMutation.error;

  // Prepare default values for edit mode
  const defaultValues = client
    ? {
        client_type: client.client_type,
        first_name: client.first_name || "",
        last_name: client.last_name || "",
        entity_name: client.entity_name || "",
        email: client.email || "",
        phone: client.phone || "",
        risk_profile: client.risk_profile as any,
        kyc_status: client.kyc_status as any,
        extra_data: client.extra_data ? JSON.stringify(client.extra_data, null, 2) : "",
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Client" : "Create New Client"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update client information. Client type cannot be changed."
              : "Add a new client to your organization. Fill in the required fields below."}
          </DialogDescription>
        </DialogHeader>

        <ClientForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          mode={isEdit ? "edit" : "create"}
        />

        {mutationError && (
          <p className="text-sm text-destructive mt-2">
            {(mutationError as any)?.message || "An error occurred"}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

