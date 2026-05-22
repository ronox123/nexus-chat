"use client";

import { Check, ChevronDown, Sparkles } from "lucide-react";
import { AI_MODELS, getModel } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (model: string) => void;
}) {
  const active = getModel(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none">
        <Sparkles className="size-4 text-emerald" />
        <span>{active.label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {AI_MODELS.map((m) => {
          const selected = m.id === value;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-accent",
              )}
            >
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                {selected && <Check className="size-4 text-emerald" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{m.label}</span>
                  {m.badge && (
                    <span className="rounded-full border border-border bg-elevated px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {m.badge}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {m.description}
                </span>
              </span>
            </button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
