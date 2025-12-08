// Simple toast hook - can be replaced with shadcn/ui toast later
import { useState, useCallback } from "react";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((props: Toast) => {
    // For now, just use alert
    // TODO: Replace with proper toast UI component
    const message = props.description 
      ? `${props.title}\n${props.description}` 
      : props.title;
    
    if (props.variant === "destructive") {
      alert(`❌ ${message}`);
    } else {
      alert(`✓ ${message}`);
    }
  }, []);

  return { toast, toasts };
}

