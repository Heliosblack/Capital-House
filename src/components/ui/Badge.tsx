import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "green" | "blue" | "red" | "gray";
  className?: string;
}

export default function Badge({ children, variant = "gray", className }: BadgeProps) {
  const variants = {
    gold: "bg-amber-50 text-amber-700 border border-amber-200",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    red: "bg-red-50 text-red-700 border border-red-200",
    gray: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full", variants[variant], className)}>
      {children}
    </span>
  );
}
