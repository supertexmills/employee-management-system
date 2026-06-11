import { Container } from "@/components/ui/container";
import { footerLinks } from "@/lib/landing-content";
import { Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import Link from "next/link";

const linkGroups = [
  { title: "Product", links: footerLinks.product },
  { title: "Company", links: footerLinks.company },
  { title: "Resources", links: footerLinks.resources },
  { title: "Legal", links: footerLinks.legal },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-slate-900 text-slate-300">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-white">F</span>
              </div>
              <span className="text-lg font-semibold text-white">
                FactoryFlow
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Enterprise workforce management for manufacturing. Attendance,
              shifts, payroll, compliance, and analytics — unified.
            </p>
            <div className="mt-6 space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +91-83559-90477
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                hello@factoryflow.io
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                Plot 42, Anand Industrial Park, Sugar Road, Sayan, Kareli -
                394130
              </div>
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-white">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} FactoryFlow. All rights reserved.
            Built for manufacturing enterprises worldwide.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-slate-400 transition-colors hover:text-white"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="text-slate-400 transition-colors hover:text-white"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
