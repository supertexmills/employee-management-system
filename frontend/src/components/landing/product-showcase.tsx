"use client";

import { DashboardPreview } from "@/components/dashboard/dashboard-preview";
import { FadeIn } from "@/components/motion/fade-in";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { showcaseTabs } from "@/lib/landing-content";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const variantMap = {
  attendance: "attendance",
  analytics: "analytics",
  shifts: "shifts",
} as const;

type ShowcaseTabId = (typeof showcaseTabs)[number]["id"];

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<ShowcaseTabId>(showcaseTabs[0].id);

  return (
    <section className="bg-surface py-24 lg:py-32">
      <Container>
        <FadeIn>
          <SectionHeading
            badge="Product Showcase"
            title="See FactoryFlow in action"
            description="Explore the dashboards that give your team complete workforce visibility."
          />
        </FadeIn>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          <FadeIn direction="left">
            <div className="flex flex-col gap-3">
              {showcaseTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "rounded-xl border p-5 text-left transition-all duration-200",
                    activeTab === tab.id
                      ? "border-primary/30 bg-white shadow-md shadow-primary/5"
                      : "border-transparent bg-transparent hover:bg-white/60",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      activeTab === tab.id
                        ? "text-primary"
                        : "text-slate-700",
                    )}
                  >
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2"
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {tab.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {tab.description}
                      </p>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.15}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <DashboardPreview
                  variant={variantMap[activeTab]}
                  className="shadow-2xl shadow-slate-900/10"
                />
              </motion.div>
            </AnimatePresence>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
