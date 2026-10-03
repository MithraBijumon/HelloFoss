import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-xs uppercase tracking-wide",
        variant === "default" && "border-border-strong text-muted",
        variant === "accent" && "border-accent/40 bg-accent-soft text-accent",
        className
      )}
    >
      {children}
    </span>
  );
}
