import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "event" | "order" | "payment" | "ticket";
}

const statusColors = {
  event: {
    draft: "bg-gray-500",
    published: "bg-green-500",
    cancelled: "bg-red-500",
    completed: "bg-blue-500",
  },
  order: {
    pending: "bg-yellow-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
    refunded: "bg-purple-500",
  },
  payment: {
    pending: "bg-yellow-500",
    completed: "bg-green-500",
    failed: "bg-red-500",
    refunded: "bg-purple-500",
  },
  ticket: {
    valid: "bg-green-500",
    used: "bg-blue-500",
    cancelled: "bg-red-500",
    refunded: "bg-purple-500",
  },
};

export function StatusBadge({ status, type = "event" }: StatusBadgeProps) {
  const colorClass = statusColors[type]?.[status as keyof typeof statusColors[typeof type]] || "bg-gray-500";

  return (
    <Badge
      className={cn(
        "text-white font-medium",
        colorClass
      )}
      variant="default"
    >
      {status}
    </Badge>
  );
}

