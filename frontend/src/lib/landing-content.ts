import {
  Building2,
  CalendarClock,
  Fingerprint,
  Palmtree,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Analytics", href: "#analytics" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

export const trustBadges = [
  "ISO 27001 Ready",
  "SOC 2 In Progress",
  "500+ Factories",
] as const;

export const trustLogos = [
  "Apex Textiles",
  "Nova Manufacturing",
  "SteelCore Industries",
  "GreenField FMCG",
  "Precision Auto Parts",
  "Global Weave Co.",
  "Summit Fabrics",
  "Vertex Assembly",
] as const;

export const certifications = [
  "ISO 9001",
  "GDPR Compliant",
  "256-bit Encryption",
] as const;

export type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const features: Feature[] = [
  {
    title: "Attendance Tracking",
    description:
      "Biometric, RFID, and mobile check-ins with real-time floor visibility.",
    icon: Fingerprint,
  },
  {
    title: "Shift Management",
    description:
      "Plan, rotate, and optimize shifts across lines with conflict detection.",
    icon: CalendarClock,
  },
  {
    title: "Payroll Integration",
    description:
      "Sync hours, overtime, and allowances directly with your payroll system.",
    icon: Wallet,
  },
  {
    title: "Leave Management",
    description:
      "Automated approvals, balance tracking, and compliance-aware policies.",
    icon: Palmtree,
  },
  {
    title: "Performance Analytics",
    description:
      "Track productivity, output per worker, and department benchmarks.",
    icon: TrendingUp,
  },
  {
    title: "Compliance Tracking",
    description:
      "Audit trails, labor law adherence, and safety certification monitoring.",
    icon: ShieldCheck,
  },
  {
    title: "Workforce Monitoring",
    description:
      "Live headcount, absentee alerts, and capacity planning dashboards.",
    icon: Users,
  },
  {
    title: "Multi-Location",
    description:
      "Centralized control across factories, warehouses, and regional sites.",
    icon: Building2,
  },
];

export const showcaseTabs = [
  {
    id: "attendance",
    label: "Attendance",
    title: "Real-time attendance intelligence",
    description:
      "Monitor check-ins across every shift and floor. Spot patterns, reduce absenteeism, and act before production is impacted.",
  },
  {
    id: "analytics",
    label: "Analytics",
    title: "Production-linked workforce metrics",
    description:
      "Connect headcount data to output KPIs. Understand which teams drive efficiency and where bottlenecks form.",
  },
  {
    id: "shifts",
    label: "Shifts",
    title: "Intelligent shift orchestration",
    description:
      "Build optimal shift schedules with skill matching, overtime controls, and instant swap requests.",
  },
] as const;

export type Benefit = {
  title: string;
  description: string;
  stat: string;
  statLabel: string;
};

export const benefits: Benefit[] = [
  {
    title: "Reduced Manual Work",
    description:
      "Eliminate spreadsheets and paper registers. Automate attendance reconciliation, leave calculations, and shift assignments in one platform.",
    stat: "60%",
    statLabel: "less manual HR work",
  },
  {
    title: "Improved Workforce Visibility",
    description:
      "See who is on the floor, which lines are staffed, and where gaps exist — updated in real time across every location.",
    stat: "Real-time",
    statLabel: "floor visibility",
  },
  {
    title: "Better Compliance",
    description:
      "Maintain audit-ready records for labor regulations, safety certifications, and overtime limits with automated alerts.",
    stat: "100%",
    statLabel: "audit-ready records",
  },
  {
    title: "Increased Productivity",
    description:
      "Align staffing with production targets. Reduce idle time and optimize shift coverage based on actual demand patterns.",
    stat: "23%",
    statLabel: "productivity uplift",
  },
  {
    title: "Cost Savings",
    description:
      "Cut payroll errors, overtime leakage, and administrative overhead with accurate, automated workforce data.",
    stat: "30%",
    statLabel: "payroll error reduction",
  },
];

export const analyticsMetrics = [
  {
    label: "Active Headcount",
    value: "1,247",
    change: "+3.2%",
    trend: "up" as const,
  },
  {
    label: "Production Output",
    value: "94.6%",
    change: "+1.8%",
    trend: "up" as const,
  },
  {
    label: "Attendance Rate",
    value: "97.1%",
    change: "+0.5%",
    trend: "up" as const,
  },
  {
    label: "Dept. Performance",
    value: "88.3",
    change: "-0.3%",
    trend: "down" as const,
  },
];

export const testimonials = [
  {
    quote:
      "FactoryFlow transformed how we manage 2,000+ workers across three plants. Absenteeism dropped 18% in the first quarter.",
    name: "Rajesh Kumar",
    title: "VP Operations",
    company: "Apex Textiles Ltd.",
    metric: "18% absenteeism reduction",
    initials: "RK",
  },
  {
    quote:
      "The payroll integration alone saved our HR team 40 hours per month. Compliance audits that took days now take hours.",
    name: "Sarah Chen",
    title: "HR Director",
    company: "Nova Manufacturing",
    metric: "40 hrs/month saved",
    initials: "SC",
  },
  {
    quote:
      "Multi-location visibility was a game-changer. We can now compare shift efficiency across all five factories in real time.",
    name: "Michael Okafor",
    title: "Plant Manager",
    company: "SteelCore Industries",
    metric: "5 sites unified",
    initials: "MO",
  },
  {
    quote:
      "Onboarding 300 seasonal workers used to be chaos. FactoryFlow streamlined the entire process with self-service check-in.",
    name: "Emily Rodriguez",
    title: "Operations Lead",
    company: "GreenField FMCG",
    metric: "300 workers onboarded",
    initials: "ER",
  },
];

export type PricingTier = {
  name: string;
  description: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    description: "For single-factory teams getting started.",
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      "Up to 100 employees",
      "Attendance tracking",
      "Shift management",
      "Basic reports",
      "Email support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Professional",
    description: "For growing manufacturers with multiple lines.",
    monthlyPrice: 149,
    annualPrice: 119,
    features: [
      "Up to 1,000 employees",
      "Everything in Starter",
      "Payroll integration",
      "Advanced analytics",
      "Leave management",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    description: "For large organizations with complex needs.",
    monthlyPrice: null,
    annualPrice: null,
    features: [
      "Unlimited employees",
      "Everything in Professional",
      "Multi-location management",
      "Custom integrations",
      "Dedicated account manager",
      "SLA & on-premise options",
    ],
    cta: "Talk to Sales",
  },
];

export const faqs = [
  {
    question: "How secure is our workforce data?",
    answer:
      "FactoryFlow uses 256-bit encryption at rest and in transit, role-based access controls, and regular third-party security audits. We are ISO 27001 ready and pursuing SOC 2 Type II certification.",
  },
  {
    question: "Can FactoryFlow integrate with our existing payroll system?",
    answer:
      "Yes. We support integrations with major payroll providers and offer a REST API for custom connections. Professional and Enterprise plans include pre-built connectors for popular systems.",
  },
  {
    question: "How long does onboarding take?",
    answer:
      "Most single-factory deployments go live within 2 weeks. Multi-location rollouts typically take 4–6 weeks with our dedicated onboarding team guiding data migration and training.",
  },
  {
    question: "Do you support multiple factory locations?",
    answer:
      "Absolutely. Enterprise plans include unlimited locations with centralized dashboards, per-site permissions, and cross-factory analytics for regional comparisons.",
  },
  {
    question: "What happens if internet connectivity is lost on the factory floor?",
    answer:
      "Our mobile and kiosk apps support offline attendance capture. Data syncs automatically when connectivity is restored, ensuring no records are lost.",
  },
  {
    question: "Is there an API for custom integrations?",
    answer:
      "Yes. All plans include read API access. Professional and Enterprise plans include full read/write API access with webhooks for real-time event notifications.",
  },
  {
    question: "What attendance methods are supported?",
    answer:
      "We support biometric scanners, RFID badges, QR codes, geofenced mobile check-in, and supervisor-assisted entry — all configurable per location and shift.",
  },
  {
    question: "Can we try FactoryFlow before committing?",
    answer:
      "Every plan includes a 14-day free trial with full feature access. No credit card required. Our team will help you set up a pilot with your actual shift data.",
  },
];

export const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Analytics", href: "#analytics" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Case Studies", href: "#" },
    { label: "Support", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Security", href: "#" },
    { label: "GDPR", href: "#" },
  ],
};
