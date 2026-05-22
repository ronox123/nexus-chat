"use client";

import { Button } from "@/components/ui/button";

export function GoogleButton({
  onClick,
  disabled,
  label = "Continue with Google",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      className="w-full"
      onClick={onClick}
      disabled={disabled}
    >
      <svg viewBox="0 0 24 24" className="size-4">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 2.8 14.7 1.8 12 1.8 6.9 1.8 2.8 6 2.8 12s4.1 10.2 9.2 10.2c5.3 0 8.8-3.7 8.8-9 0-.6-.06-1-.15-1.5H12z"
        />
      </svg>
      {label}
    </Button>
  );
}
