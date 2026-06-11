"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/lib/landing-content";
import { Quote } from "lucide-react";

export function Testimonials() {
  return (
    <section className="bg-surface py-24 lg:py-32">
      <Container>
        <FadeIn>
          <SectionHeading
            badge="Testimonials"
            title="Trusted by manufacturing leaders"
            description="See how enterprises are transforming workforce management with FactoryFlow."
          />
        </FadeIn>

        <StaggerChildren className="mt-16 flex gap-6 overflow-x-auto pb-4 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0 xl:grid-cols-4">
          {testimonials.map((t) => (
            <StaggerItem
              key={t.name}
              className="w-[300px] shrink-0 lg:w-auto"
            >
              <div className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
                <Quote className="mb-4 h-5 w-5 text-primary/40" />
                <p className="flex-1 text-sm leading-relaxed text-slate-600">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-border pt-4">
                  <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {t.metric}
                  </span>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.title}, {t.company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}
