"use client";

import { ShowcaseMock } from "@/components/landing/showcase-mock";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { GlassCard } from "@/components/ui/glass-card";
import { trustBadges } from "@/lib/landing-content";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white" />
      <div className="dot-grid absolute inset-0 opacity-30" />

      <Container className="relative">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn>
            <Badge className="mb-6 border-blue-100 bg-blue-50/80 text-primary">
              Enterprise Workforce Management
            </Badge>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl xl:text-7xl">
              Workforce intelligence for{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                modern manufacturing
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
              Unify attendance, shifts, payroll, and compliance across every
              factory floor. FactoryFlow gives operations teams real-time
              visibility and control at enterprise scale.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Play className="h-4 w-4" />
                Book a Demo
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {trustBadges.map((badge) => (
                <Badge key={badge}>{badge}</Badge>
              ))}
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.5} className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-2xl" />
          <GlassCard className="relative overflow-hidden p-2 sm:p-3">
            <ShowcaseMock variant="hero" />
          </GlassCard>
          <motion.div
            className="absolute -right-4 -bottom-4 hidden rounded-xl border border-border bg-white p-3 shadow-lg lg:block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] text-muted-foreground">Attendance Rate</p>
            <p className="text-lg font-semibold text-green-600">97.1%</p>
          </motion.div>
        </FadeIn>
      </Container>
    </section>
  );
}
