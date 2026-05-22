"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "@/components/auth/auth-provider";
import { getFirebase } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const { isMock } = useAuth();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fb = getFirebase();
    if (fb) {
      try {
        await sendPasswordResetEmail(fb.auth, email);
      } catch (e) {
        setLoading(false);
        return toast.error((e as { message?: string }).message ?? "Could not send reset email.");
      }
    } else {
      await new Promise((r) => setTimeout(r, 600));
    }
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="animate-[rise_0.4s_cubic-bezier(0.22,1,0.36,1)] text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-emerald/25 bg-emerald-dim/40">
          <MailCheck className="size-5 text-emerald" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isMock
            ? "Preview mode — no email is actually sent. Head back to sign in."
            : `If an account exists for ${email}, a reset link is on its way.`}
        </p>
        <Button asChild variant="secondary" size="lg" className="mt-6 w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-[rise_0.4s_cubic-bezier(0.22,1,0.36,1)]">
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
    </div>
  );
}
