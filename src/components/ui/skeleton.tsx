import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-[linear-gradient(90deg,var(--color-muted)_25%,var(--color-elevated)_50%,var(--color-muted)_75%)] bg-[length:200%_100%]",
        "animate-[shimmer_1.6s_linear_infinite]",
        className,
      )}
      {...props}
    />
  );
}
