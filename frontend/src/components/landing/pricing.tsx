"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { pricingTiers } from "@/lib/landing-content";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";
import { useState } from "react";

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 lg:py-32">
      <Container>
        <FadeIn>
          <SectionHeading
            badge="Pricing"
            title="Plans that scale with your operations"
            description="Start with a 14-day free trial. No credit card required."
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-10 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-sm font-medium",
                !annual ? "text-slate-900" : "text-muted-foreground",
              )}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              aria-label="Toggle annual billing"
              onClick={() => setAnnual(!annual)}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                annual ? "bg-primary" : "bg-slate-200",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                  annual && "translate-x-5",
                )}
              />
            </button>
            <span
              className={cn(
                "text-sm font-medium",
                annual ? "text-slate-900" : "text-muted-foreground",
              )}
            >
              Annual
            </span>
            {annual && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                Save 20%
              </span>
            )}
          </div>
        </FadeIn>

        <StaggerChildren className="mt-12 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier) => {
            const price = annual ? tier.annualPrice : tier.monthlyPrice;

            return (
              <StaggerItem key={tier.name}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border p-8",
                    tier.highlighted
                      ? "border-primary bg-white shadow-xl shadow-primary/10"
                      : "border-border bg-white",
                  )}
                >
                  {tier.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{tier.description}</p>

                  <div className="mt-6">
                    {price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-900">
                          ${price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /mo
                        </span>
                      </div>
                    ) : (
                      <span className="text-4xl font-bold text-slate-900">
                        Custom
                      </span>
                    )}
                  </div>

                  <ul className="mt-8 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={tier.highlighted ? "primary" : "outline"}
                    className="mt-8 w-full"
                  >
                    {tier.cta}
                  </Button>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </Container>
    </section>
  );
}
