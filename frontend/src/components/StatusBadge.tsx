import React from "react";

interface StatusBadgeProps {
  status:
    | "active"
    | "locked"
    | "delivered"
    | "returned"
    | "pending"
    | "completed"
    | "failed"
    | string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const statusConfig: Record<
    string,
    { bg: string; text: string; icon: string }
  > = {
    active: { bg: "bg-green-100", text: "text-green-800", icon: "✅" },
    locked: { bg: "bg-red-100", text: "text-red-800", icon: "🔒" },
    delivered: { bg: "bg-blue-100", text: "text-blue-800", icon: "📦" },
    returned: { bg: "bg-orange-100", text: "text-orange-800", icon: "↩️" },
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⏳" },
    completed: { bg: "bg-green-100", text: "text-green-800", icon: "✅" },
    failed: { bg: "bg-red-100", text: "text-red-800", icon: "❌" },
  };

  const config = statusConfig[status.toLowerCase()] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    icon: "•",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span>{config.icon}</span>
      <span>{status}</span>
    </span>
  );
};
