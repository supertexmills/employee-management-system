import { Analytics } from "@/components/landing/analytics";
import { Benefits } from "@/components/landing/benefits";
import { EnterpriseCTA } from "@/components/landing/enterprise-cta";
import { FAQ } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Pricing } from "@/components/landing/pricing";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { Testimonials } from "@/components/landing/testimonials";
import { TrustBar } from "@/components/landing/trust-bar";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <Features />
        <ProductShowcase />
        <Benefits />
        <Analytics />
        <Testimonials />
        <Pricing />
        <FAQ />
        <EnterpriseCTA />
      </main>
      <Footer />
    </>
  );
}
