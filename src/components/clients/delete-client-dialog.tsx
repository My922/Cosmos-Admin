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
import { Label } from "@/components/ui/label";
import { useDeleteClient } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Client {
  id: string;
  display_name: string;
  email?: string;
}

interface DeleteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export function DeleteClientDialog({
  open,
  onOpenChange,
  client,
}: DeleteClientDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const deleteMutation = useDeleteClient();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!client) return;

    try {
      await deleteMutation.mutateAsync(client.id);
      toast({
        title: "Client deleted",
        description: `${client.display_name || "Client"} has been deleted successfully.`,
      });
      onOpenChange(false);
      setConfirmText("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete client. Please try again.",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText("");
    }
    onOpenChange(newOpen);
  };

  const displayName = client?.display_name || "this client";
  const isConfirmed = confirmText === displayName;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Client</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete <strong>{displayName}</strong> and all
            associated data including accounts, holdings, and documents.
            <br />
            <br />
            This action cannot be undone. To confirm, please type the client name below:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="confirm-name">Client Name</Label>
          <Input
            id="confirm-name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={displayName}
            className="mt-2"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

