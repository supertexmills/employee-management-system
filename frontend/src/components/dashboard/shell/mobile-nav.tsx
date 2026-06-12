"use client";

import { AppSidebar } from "@/components/dashboard/shell/app-sidebar";
import { AnimatePresence, motion } from "framer-motion";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden"
            onClick={onClose}
            aria-label="Close navigation overlay"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
          >
            <AppSidebar onNavigate={onClose} className="h-full shadow-xl" />
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
