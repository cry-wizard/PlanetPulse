import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none cursor-pointer";

    const variants = {
      primary:
        "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-dark-950 font-semibold shadow-[0_2px_12px_rgba(34,197,94,0.3)] hover:shadow-[0_4px_20px_rgba(34,197,94,0.45)] active:from-primary-600 active:to-primary-700",
      secondary:
        "bg-dark-800/80 hover:bg-dark-700 text-dark-100 border border-white/[0.08] hover:border-white/[0.15] shadow-sm active:bg-dark-800",
      ghost:
        "bg-transparent text-dark-300 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.1]",
      danger:
        "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 hover:border-red-500/50 shadow-sm active:bg-red-500/30",
      outline:
        "border border-primary-500/40 text-primary-400 bg-primary-500/5 hover:bg-primary-500/15 hover:border-primary-500 active:bg-primary-500/20",
    };

    const sizes = {
      sm: "min-h-8 px-3 py-1 text-xs",
      md: "min-h-10 px-4 sm:px-5 py-2 text-sm",
      lg: "min-h-12 px-6 sm:px-8 py-2.5 text-base",
      icon: "min-h-9 min-w-9 h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
