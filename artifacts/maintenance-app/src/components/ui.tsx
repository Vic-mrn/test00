import React, { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// --- BUTTON ---
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5",
      outline: "border-2 border-slate-200 bg-transparent hover:border-slate-300 hover:bg-slate-50 text-slate-700",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
      danger: "bg-red-600 text-white shadow-md shadow-red-600/20 hover:bg-red-700 hover:shadow-lg",
      secondary: "bg-slate-800 text-white shadow-md hover:bg-slate-700 hover:shadow-lg",
    };
    
    const sizes = {
      default: "h-11 px-5 py-2",
      sm: "h-9 px-3 text-sm",
      lg: "h-14 px-8 text-lg",
      icon: "h-11 w-11 p-2 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// --- CARD ---
export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("bg-card text-card-foreground rounded-2xl border border-border shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string, children: React.ReactNode }) {
  return <h3 className={cn("text-2xl font-display font-semibold leading-none tracking-tight", className)}>{children}</h3>;
}

export function CardContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

// --- BADGE ---
export function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: string, className?: string }) {
  const variants: Record<string, string> = {
    default: "bg-slate-100 text-slate-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    // Status specific
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cancelled: "bg-slate-200 text-slate-700 border-slate-300",
    // Priority specific
    low: "bg-slate-100 text-slate-700",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800 shadow-sm shadow-red-200",
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-transparent", variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
}

// --- FORMS ---
export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
  )
);
Label.displayName = "Label";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-400",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-400",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 py-2 pr-10 text-sm transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-400",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

// --- MODAL ---
export function Modal({ isOpen, onClose, title, description, children }: { isOpen: boolean, onClose: () => void, title: string, description?: string, children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-800">{title}</h2>
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- SKELETON ---
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200", className)} />;
}
