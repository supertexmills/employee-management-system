"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { benefits } from "@/lib/landing-content";
import { cn } from "@/lib/cn";
import { CheckCircle2 } from "lucide-react";

function parseStat(stat: string): { value: number; prefix: string; suffix: string; decimals: number } {
  const match = stat.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { value: 0, prefix: "", suffix: stat, decimals: 0 };
  const num = parseFloat(match[2]);
  const decimals = match[2].includes(".") ? 1 : 0;
  return { value: num, prefix: match[1], suffix: match[3], decimals };
}

export function Benefits() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <FadeIn>
          <SectionHeading
            badge="Benefits"
            title="Measurable impact from day one"
            description="FactoryFlow delivers tangible results across operations, HR, and finance teams."
          />
        </FadeIn>

        <div className="mt-16 space-y-16 lg:space-y-24">
          {benefits.map((benefit, index) => {
            const isReversed = index % 2 === 1;
            const stat = parseStat(benefit.stat);

            return (
              <FadeIn key={benefit.title} direction={isReversed ? "right" : "left"}>
                <div
                  className={cn(
                    "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
                    isReversed && "lg:[direction:rtl]",
                  )}
                >
                  <div className={cn(isReversed && "lg:[direction:ltr]")}>
                    <div className="mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        {benefit.statLabel}
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                      {benefit.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
                      {benefit.description}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "flex items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-blue-50 to-slate-50 p-12 lg:p-16",
                      isReversed && "lg:[direction:ltr]",
                    )}
                  >
                    {stat.value > 0 ? (
                      <div className="text-center">
                        <p className="text-5xl font-bold tracking-tight text-primary sm:text-6xl lg:text-7xl">
                          <AnimatedCounter
                            value={stat.value}
                            prefix={stat.prefix}
                            suffix={stat.suffix}
                            decimals={stat.decimals}
                          />
                        </p>
                        <p className="mt-2 text-sm font-medium text-muted">
                          {benefit.statLabel}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                          {benefit.stat}
                        </p>
                        <p className="mt-2 text-sm font-medium text-muted">
                          {benefit.statLabel}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
