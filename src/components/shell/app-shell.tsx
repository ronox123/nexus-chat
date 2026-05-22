"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/lib/store/ui-store";
import { Sidebar } from "@/components/sidebar/sidebar";
import { TopBar } from "@/components/shell/top-bar";
import { SettingsDialog } from "@/components/settings/settings-dialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { collapsed, mobileOpen, setMobileOpen } = useUIStore();

  // Lock body scroll while the mobile drawer is open.
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 0 : 288 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="hidden shrink-0 overflow-hidden border-r border-border lg:block"
      >
        <div className="h-full w-72">
          <Sidebar />
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border shadow-2xl lg:hidden"
            >
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
      </div>

      <SettingsDialog />
    </div>
  );
}
