import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col">
        <div className="aurora pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Logo />
          <div className="max-w-md">
            <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground">
              A calmer, faster way to think with AI.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Nexus is a premium workspace for focused conversations — streaming responses,
              organized history, and an interface that gets out of your way.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm text-subtle-foreground">
              <span className="size-1.5 rounded-full bg-emerald" />
              Trusted by people who care about craft
            </div>
          </div>
          <p className="text-xs text-subtle-foreground">
            © {new Date().getFullYear()} Nexus. Crafted for deep work.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-dvh items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
          <p className="mt-10 text-center text-xs text-subtle-foreground">
            By continuing you agree to our{" "}
            <Link href="#" className="text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-muted-foreground underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
