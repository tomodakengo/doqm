import { AlertCircle, CheckCircle } from "lucide-react";
import React from "react";

export type Message =
  | { type: "error"; message: string }
  | { type: "success"; message: string }
  | Record<string, never>;

export function FormMessage({
  message,
}: {
  message: Message;
}): React.ReactNode {
  if (!message || !("type" in message)) {
    return null;
  }

  const Icon = message.type === "error" ? AlertCircle : CheckCircle;
  const bgColor = message.type === "error" ? "bg-red-50" : "bg-green-50";
  const textColor =
    message.type === "error" ? "text-red-500" : "text-green-500";
  const borderColor =
    message.type === "error" ? "border-red-200" : "border-green-200";

  return (
    <div
      className={`flex items-center p-3 rounded-md border ${bgColor} ${borderColor}`}
    >
      <Icon className={`w-5 h-5 mr-2 ${textColor}`} />
      <span className={`text-sm ${textColor}`}>{message.message}</span>
    </div>
  );
}
