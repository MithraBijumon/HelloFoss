import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border border-dashed border-border-strong bg-card px-6 py-16 text-center",
        className
      )}
    >
      <Icon className="h-8 w-8 text-muted-subtle" strokeWidth={1.5} aria-hidden="true" />
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
