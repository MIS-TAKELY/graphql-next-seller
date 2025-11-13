// lib/utils/orderUtils.ts
import { CheckCircle, Package, Truck, XCircle } from "lucide-react";

// Define a type for the icon configuration
type IconConfig = {
  Icon: React.ComponentType<{ className?: string }>;
  className?: string;
};

export const getStatusIcon = (status: string): IconConfig => {
  const defaultClassName = "h-3 w-3 sm:h-4 sm:w-4";
  switch (status) {
    case "pending":
    case "processing":
      return { Icon: Package, className: defaultClassName };
    case "shipped":
      return { Icon: Truck, className: defaultClassName };
    case "delivered":
      return { Icon: CheckCircle, className: defaultClassName };
    case "cancelled":
    case "returned":
      return { Icon: XCircle, className: defaultClassName };
    default:
      return { Icon: Package, className: defaultClassName };
  }
};

export const getStatusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "shipped":
      return "outline";
    case "delivered":
      return "default";
    case "cancelled":
    case "returned":
      return "destructive";
    default:
      return "secondary";
  }
};

export const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "high":
      return "destructive";
    case "normal":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "secondary";
  }
};