"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRight, MessageSquare } from "lucide-react";

export function EnterpriseCTA() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent px-8 py-16 text-center sm:px-16 lg:py-20">
            <div className="orb -top-20 -left-20 h-64 w-64 bg-white" />
            <div
              className="orb -right-20 -bottom-20 h-64 w-64 bg-sky-300"
              style={{ animationDelay: "2s" }}
            />

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ready to modernize your factory workforce?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
                Join 500+ manufacturing enterprises using FactoryFlow to
                streamline operations, ensure compliance, and boost productivity.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-blue-50 sm:w-auto"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                >
                  <MessageSquare className="h-4 w-4" />
                  Talk to Sales
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
