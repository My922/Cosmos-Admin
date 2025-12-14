"use client";

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
import { useDeleteProduct } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";
import { Loader2 } from "lucide-react";

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
}: DeleteProductDialogProps) {
  const deleteMutation = useDeleteProduct();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!product) return;

    try {
      await deleteMutation.mutateAsync(product.id);
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully.",
      });
      onOpenChange(false);
    } catch (error: any) {
      let errorMessage = "Failed to delete product. Please try again.";
      if (error instanceof Error) {
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

  const isDefault = product?.is_default;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{product?.name}&rdquo;?
            {isDefault && (
              <span className="block mt-2 text-yellow-600 font-medium">
                Warning: This is a platform default product. Deleting it will affect all tenants.
              </span>
            )}
            <span className="block mt-2">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
