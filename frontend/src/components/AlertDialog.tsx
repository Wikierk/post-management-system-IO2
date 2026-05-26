import React from "react";

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "info" | "success" | "error" | "warning";
  onClose: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title,
  message,
  type = "info",
  onClose,
}) => {
  if (!isOpen) return null;

  const bgColor = {
    info: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
  }[type];

  const titleColor = {
    info: "text-blue-800",
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-yellow-800",
  }[type];

  const icon = {
    info: "ℹ️",
    success: "✅",
    error: "❌",
    warning: "⚠️",
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`rounded-lg shadow-2xl max-w-sm w-full mx-4 p-6 border-l-4 ${bgColor}`}
      >
        <div className="flex items-start gap-4">
          <span className="text-3xl">{icon}</span>
          <div className="flex-1">
            <h2 className={`text-lg font-bold mb-2 ${titleColor}`}>{title}</h2>
            <p className="text-gray-700 mb-6">{message}</p>
            <button
              onClick={onClose}
              className={`px-4 py-2 text-white rounded font-bold transition ${
                type === "error"
                  ? "bg-red-600 hover:bg-red-700"
                  : type === "warning"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : type === "success"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
