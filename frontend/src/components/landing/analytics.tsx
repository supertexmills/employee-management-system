"use client";

import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { analyticsMetrics } from "@/lib/landing-content";
import { cn } from "@/lib/cn";
import { TrendingDown, TrendingUp } from "lucide-react";

export function Analytics() {
  return (
    <section id="analytics" className="py-24 lg:py-32">
      <Container>
        <FadeIn>
          <SectionHeading
            badge="Advanced Analytics"
            title="Real-time workforce intelligence"
            description="Connect workforce data to production outcomes with dashboards built for manufacturing leaders."
          />
        </FadeIn>

        <FadeIn delay={0.15} className="mt-16">
          <div className="overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8 lg:p-10">
            <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {analyticsMetrics.map((metric) => (
                <StaggerItem key={metric.label}>
                  <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 backdrop-blur-sm">
                    <p className="text-xs font-medium text-slate-400">
                      {metric.label}
                    </p>
                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-2xl font-semibold text-white">
                        {metric.value}
                      </p>
                      <span
                        className={cn(
                          "flex items-center gap-0.5 text-xs font-medium",
                          metric.trend === "up"
                            ? "text-green-400"
                            : "text-red-400",
                        )}
                      >
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {metric.change}
                      </span>
                    </div>
                    <div className="mt-3">
                      <AnalyticsChart
                        color={
                          metric.trend === "up" ? "#4ADE80" : "#F87171"
                        }
                      />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>

            <div className="mt-6 rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">
                  Department Performance — Last 30 Days
                </p>
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                  +12.4% overall
                </span>
              </div>
              <AnalyticsChart variant="bar" color="#60A5FA" className="h-16" />
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
