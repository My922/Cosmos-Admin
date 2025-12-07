"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useDeleteTenant, useDeleteTenantPermanent } from "@/hooks/use-api";
import { Loader2, AlertTriangle } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface DeleteTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  mode: "deactivate" | "permanent";
}

export function DeleteTenantDialog({
  open,
  onOpenChange,
  tenant,
  mode,
}: DeleteTenantDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const deleteTenant = useDeleteTenant();
  const deleteTenantPermanent = useDeleteTenantPermanent();

  const handleDelete = async () => {
    if (!tenant) return;
    
    // For permanent delete, require confirmation text
    if (mode === "permanent" && confirmText !== tenant.slug) {
      return;
    }
    
    setIsDeleting(true);
    try {
      if (mode === "permanent") {
        await deleteTenantPermanent.mutateAsync(tenant.id);
      } else {
        await deleteTenant.mutateAsync(tenant.id);
      }
      onOpenChange(false);
      setConfirmText("");
    } catch (error) {
      console.error("Failed to delete tenant:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmText("");
    }
    onOpenChange(open);
  };

  if (!tenant) return null;

  if (mode === "permanent") {
    return (
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Permanently Delete Tenant
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  You are about to <strong className="text-destructive">permanently delete</strong>{" "}
                  <strong>{tenant.name}</strong>.
                </p>
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm">
                  <p className="font-medium text-destructive">⚠️ This action cannot be undone!</p>
                  <p className="mt-1 text-muted-foreground">
                    All associated data will be permanently deleted:
                  </p>
                  <ul className="mt-2 list-disc list-inside text-muted-foreground space-y-1">
                    <li>All users belonging to this tenant</li>
                    <li>All clients and their accounts</li>
                    <li>All transactions and holdings</li>
                    <li>All documents and audit logs</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    To confirm, type <strong className="font-mono bg-muted px-1 py-0.5 rounded">{tenant.slug}</strong> below:
                  </p>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={tenant.slug}
                    className="font-mono"
                    disabled={isDeleting}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || confirmText !== tenant.slug}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Deactivate mode (soft delete)
  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate Tenant</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Are you sure you want to deactivate <strong>{tenant.name}</strong>?
              </p>
              <p className="text-sm">
                This will:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Prevent all users from logging in</li>
                <li>Hide the tenant from active listings</li>
                <li>Preserve all data for potential reactivation</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                You can reactivate this tenant later from the edit screen.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deactivate Tenant
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
