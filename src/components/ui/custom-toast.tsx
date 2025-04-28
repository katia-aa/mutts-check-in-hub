
import * as React from "react";
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Info, PawPrint, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "encouragement";

interface ToastProps extends React.ComponentPropsWithoutRef<typeof SonnerToaster> {
  type?: ToastType;
}

// Map toast types to their respective colors and icons
const toastStyles: Record<ToastType, { bgColor: string; icon: React.ReactNode }> = {
  success: { 
    bgColor: "bg-[#F2FCE2] border-green-200", 
    icon: <CheckCircle className="w-5 h-5 text-green-600" />
  },
  error: { 
    bgColor: "bg-red-50 border-red-200", 
    icon: <XCircle className="w-5 h-5 text-[#ea384c]" />
  },
  info: { 
    bgColor: "bg-[#D3E4FD] border-blue-200", 
    icon: <Info className="w-5 h-5 text-blue-600" />
  },
  encouragement: { 
    bgColor: "bg-[#FEC6A1] border-orange-200", 
    icon: <PawPrint className="w-5 h-5 text-orange-600" />
  }
};

export const CustomToaster = ({ ...props }: ToastProps) => {
  return (
    <SonnerToaster
      className="toaster group"
      position="top-center"
      toastOptions={{
        duration: 5000,
        className: "max-w-md mx-auto rounded-full border shadow-lg animate-fade-in",
        classNames: {
          title: "text-base font-medium",
          toast: "group flex items-center gap-3 py-3 px-4 bg-white",
          closeButton: "absolute right-2 rounded-full p-1 text-gray-400 opacity-0 transition hover:bg-gray-100 group-hover:opacity-100",
          actionButton: "bg-primary text-primary-foreground",
        },
      }}
      closeButton
      richColors
      {...props}
    />
  );
};

export function toast({
  title,
  description,
  type = "info",
  ...props
}: {
  title?: string;
  description?: string;
  type?: ToastType;
} & React.ComponentProps<typeof sonnerToast>) {
  const { bgColor, icon } = toastStyles[type];
  
  return sonnerToast(
    <div className="flex items-center gap-2">
      {icon}
      <div>
        {title && <p className="font-medium">{title}</p>}
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    </div>,
    {
      className: cn("rounded-full border", bgColor),
      closeButton: true,
      ...props,
    }
  );
}
