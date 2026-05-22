"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground",
        "placeholder:text-subtle-foreground transition-colors duration-200",
        "focus-visible:outline-none focus-visible:border-emerald/50 focus-visible:ring-2 focus-visible:ring-emerald/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
