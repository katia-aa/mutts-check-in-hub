
import { toast as customToast } from "@/components/ui/custom-toast";

type ToastType = "success" | "error" | "info" | "encouragement";

export interface CustomToastProps {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export function useCustomToast() {
  const toast = ({ title, description, type = "info", duration = 5000 }: CustomToastProps) => {
    return customToast({
      title,
      description,
      type,
      duration,
    });
  };

  return {
    toast: {
      success: (props: Omit<CustomToastProps, "type">) => toast({ ...props, type: "success" }),
      error: (props: Omit<CustomToastProps, "type">) => toast({ ...props, type: "error" }),
      info: (props: Omit<CustomToastProps, "type">) => toast({ ...props, type: "info" }),
      encouragement: (props: Omit<CustomToastProps, "type">) => toast({ ...props, type: "encouragement" }),
    },
  };
}
