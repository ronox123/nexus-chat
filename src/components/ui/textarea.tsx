"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground",
      "placeholder:text-subtle-foreground transition-colors duration-200 resize-none",
      "focus-visible:outline-none focus-visible:border-emerald/50 focus-visible:ring-2 focus-visible:ring-emerald/15",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
