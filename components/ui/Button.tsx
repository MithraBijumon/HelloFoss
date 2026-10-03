import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:opacity-90 border border-foreground",
  secondary:
    "bg-transparent text-foreground border border-border-strong hover:bg-card-hover",
  ghost: "bg-transparent text-foreground hover:bg-card-hover border border-transparent",
};

export const buttonSizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export const buttonBaseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:pointer-events-none";

interface ButtonProps {
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  target?: string;
  rel?: string;
}

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
  type = "button",
  target,
  rel,
}: ButtonProps) {
  const classes = cn(
    buttonBaseClasses,
    buttonVariantClasses[variant],
    buttonSizeClasses[size],
    className
  );

  if (href) {
    const isExternal = href.startsWith("http");
    return (
      <Link
        href={href}
        className={classes}
        target={target ?? (isExternal ? "_blank" : undefined)}
        rel={rel ?? (isExternal ? "noopener noreferrer" : undefined)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
