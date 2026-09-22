import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, padding = "md", className, ...props }, ref) => {
    const paddings = {
      none: "",
      sm: "p-3 sm:p-4",
      md: "p-4 sm:p-6",
      lg: "p-5 sm:p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white dark:bg-dark-950/75 text-dark-900 dark:text-dark-100 rounded-2xl border border-neutral-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-sm transition-all duration-200",
          paddings[padding],
          hover ? "hover:translate-y-[-2px] hover:shadow-md hover:border-primary-500/30 dark:hover:border-primary-500/30" : "",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

/** Card with a subtle top accent line */
export interface CardAccentProps extends Omit<CardProps, "children"> {
  accent?: "green" | "amber" | "blue" | "purple" | "none";
  children?: React.ReactNode;
}

export const CardAccent = forwardRef<HTMLDivElement, CardAccentProps>(
  ({ accent = "none", className, children, ...props }, ref) => {
    const accents = {
      green: "border-t-4 border-primary-500",
      amber: "border-t-4 border-accent-500",
      blue: "border-t-4 border-blue-500",
      purple: "border-t-4 border-purple-500",
      none: "",
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          accents[accent],
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  },
);
CardAccent.displayName = "CardAccent";

// --- Shadcn-style card sub-components (alias-compatible) ---

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)} {...props}>
      {children}
    </div>
  ),
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-base sm:text-lg font-display font-semibold leading-snug tracking-tight text-dark-900 dark:text-dark-100", className)} {...props}>
      {children}
    </h3>
  ),
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs sm:text-sm text-neutral-500 dark:text-dark-400 leading-relaxed", className)} {...props}>
      {children}
    </p>
  ),
);
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 sm:p-6 pt-0", className)} {...props}>
      {children}
    </div>
  ),
);
CardContent.displayName = "CardContent";