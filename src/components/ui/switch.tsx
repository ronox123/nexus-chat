"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none",
      "focus-visible:ring-2 focus-visible:ring-emerald/30",
      "data-[state=checked]:bg-emerald/80 data-[state=unchecked]:bg-overlay data-[state=unchecked]:border-border-strong",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-[16px] rounded-full bg-foreground shadow-sm transition-transform",
        "data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[3px]",
        "data-[state=checked]:bg-background",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
