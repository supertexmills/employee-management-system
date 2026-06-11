"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { Container } from "@/components/ui/container";
import { certifications, trustLogos } from "@/lib/landing-content";
import { Shield } from "lucide-react";

export function TrustBar() {
  const logos = [...trustLogos, ...trustLogos];

  return (
    <section className="border-y border-border bg-surface py-12">
      <Container>
        <FadeIn>
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
            Trusted by manufacturing leaders across textiles, automotive, and
            FMCG
          </p>
        </FadeIn>

        <div className="relative overflow-hidden">
          <div className="marquee-track gap-12">
            {logos.map((logo, i) => (
              <div
                key={`${logo}-${i}`}
                className="flex shrink-0 items-center gap-2 px-4"
              >
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
                <span className="whitespace-nowrap text-sm font-semibold text-slate-400">
                  {logo}
                </span>
              </div>
            ))}
          </div>
        </div>

        <FadeIn delay={0.2}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {certifications.map((cert) => (
              <div
                key={cert}
                className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-slate-600"
              >
                <Shield className="h-3.5 w-3.5 text-primary" />
                {cert}
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
