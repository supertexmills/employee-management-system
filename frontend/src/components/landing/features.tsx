"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { features } from "@/lib/landing-content";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <Container>
        <FadeIn>
          <SectionHeading
            badge="Core Features"
            title="Everything your factory workforce needs"
            description="From the shop floor to the boardroom — manage every aspect of your workforce in one unified platform."
          />
        </FadeIn>

        <StaggerChildren className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <motion.div
                className="group h-full rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-slate-900/5"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div
                  className={cn(
                    "mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-primary",
                    "transition-colors group-hover:bg-primary group-hover:text-white",
                  )}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}
