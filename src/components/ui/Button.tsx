import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "brand-green" | "brand-teal";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantClasses = {
      primary: "bg-[#1b4db3] text-white hover:bg-[#153e94] focus:ring-[#1b4db3] shadow-md shadow-[#1b4db3]/20 hover:shadow-lg hover:shadow-[#1b4db3]/30",
      "brand-green": "bg-[#3a991d] text-white hover:bg-[#2e7b17] focus:ring-[#3a991d] shadow-md shadow-[#3a991d]/20 hover:shadow-lg hover:shadow-[#3a991d]/30",
      "brand-teal": "bg-gradient-to-r from-[#1b4db3] to-[#3a991d] text-white hover:opacity-95 focus:ring-[#1b4db3] shadow-md shadow-[#1b4db3]/20",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-300",
      outline: "border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 focus:ring-slate-400 shadow-2xs",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
      ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-200",
    };

    const sizeClasses = {
      sm: "text-xs px-2.5 py-1.5 h-8 gap-1.5",
      md: "text-sm px-4 py-2 h-10 gap-2",
      lg: "text-base px-6 py-3 h-12 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseClasses, variantClasses[variant], sizeClasses[size], className))}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
