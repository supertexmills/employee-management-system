"use client";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { cn } from "@/lib/cn";
import {
  BarChart3,
  Calendar,
  Clock,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { AnalyticsChart } from "./analytics-chart";

type DashboardVariant = "hero" | "attendance" | "analytics" | "shifts";

type DashboardPreviewProps = {
  variant?: DashboardVariant;
  className?: string;
};

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Workforce" },
  { icon: Clock, label: "Attendance" },
  { icon: Calendar, label: "Shifts" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

export function DashboardPreview({
  variant = "hero",
  className,
}: DashboardPreviewProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-white shadow-xl shadow-slate-900/5",
        className,
      )}
    >
      <div className="flex h-full min-h-[320px]">
        {/* Sidebar */}
        <div className="hidden w-44 shrink-0 border-r border-border bg-slate-50 p-3 sm:block">
          <div className="mb-4 flex items-center gap-2 px-2">
            <div className="h-6 w-6 rounded-md bg-primary" />
            <span className="text-xs font-semibold text-slate-900">
              FactoryFlow
            </span>
          </div>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                  item.active
                    ? "bg-blue-50 font-medium text-primary"
                    : "text-slate-500",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-5">
          {variant === "hero" && <HeroContent />}
          {variant === "attendance" && <AttendanceContent />}
          {variant === "analytics" && <AnalyticsContent />}
          {variant === "shifts" && <ShiftsContent />}
        </div>
      </div>
    </div>
  );
}

function HeroContent() {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Today&apos;s Overview</p>
          <p className="text-sm font-semibold text-slate-900">
            Floor A — Morning Shift
          </p>
        </div>
        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
          Live
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: "Present", value: 247, color: "text-primary" },
          { label: "Absent", value: 8, color: "text-red-500" },
          { label: "On Leave", value: 12, color: "text-amber-500" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border border-border bg-slate-50 p-2.5"
          >
            <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
            <p className={cn("text-lg font-semibold", kpi.color)}>
              <AnimatedCounter value={kpi.value} duration={1.2} />
            </p>
          </div>
        ))}
      </div>

      <div className="mb-3 rounded-lg border border-border p-3">
        <p className="mb-2 text-[10px] font-medium text-slate-700">
          Attendance Trend
        </p>
        <AnalyticsChart />
      </div>

      <div className="space-y-1.5">
        {[
          { name: "Line 1 — Assembly", count: "42/45", status: "ok" },
          { name: "Line 2 — Packaging", count: "38/40", status: "ok" },
          { name: "Line 3 — QC", count: "18/22", status: "warn" },
        ].map((line) => (
          <div
            key={line.name}
            className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5"
          >
            <span className="text-[10px] text-slate-600">{line.name}</span>
            <span
              className={cn(
                "text-[10px] font-medium",
                line.status === "ok" ? "text-green-600" : "text-amber-600",
              )}
            >
              {line.count}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function AttendanceContent() {
  const rows = [
    { id: "EMP-1042", name: "Priya S.", time: "06:02 AM", status: "On Time" },
    { id: "EMP-0876", name: "James L.", time: "06:15 AM", status: "On Time" },
    { id: "EMP-1203", name: "Ahmed K.", time: "06:45 AM", status: "Late" },
    { id: "EMP-0954", name: "Maria G.", time: "—", status: "Absent" },
    { id: "EMP-1108", name: "David W.", time: "05:58 AM", status: "On Time" },
  ];

  return (
    <>
      <p className="mb-3 text-sm font-semibold text-slate-900">
        Live Check-ins
      </p>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-[10px]">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-muted-foreground">
              <th className="px-2.5 py-2 font-medium">Employee</th>
              <th className="px-2.5 py-2 font-medium">Check-in</th>
              <th className="px-2.5 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-2.5 py-2">
                  <p className="font-medium text-slate-800">{row.name}</p>
                  <p className="text-muted-foreground">{row.id}</p>
                </td>
                <td className="px-2.5 py-2 text-slate-600">{row.time}</td>
                <td className="px-2.5 py-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-medium",
                      row.status === "On Time" && "bg-green-50 text-green-700",
                      row.status === "Late" && "bg-amber-50 text-amber-700",
                      row.status === "Absent" && "bg-red-50 text-red-700",
                    )}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AnalyticsContent() {
  return (
    <>
      <p className="mb-3 text-sm font-semibold text-slate-900">
        Production Analytics
      </p>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {[
          { label: "Output Rate", value: "94.6%" },
          { label: "Efficiency", value: "88.3" },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-border bg-slate-50 p-2.5"
          >
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
            <p className="text-base font-semibold text-slate-900">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="mb-2 text-[10px] font-medium text-slate-700">
          Weekly Output
        </p>
        <AnalyticsChart variant="bar" />
      </div>
    </>
  );
}

function ShiftsContent() {
  const shifts = [
    { name: "Morning A", time: "06:00 – 14:00", staff: "124/130", fill: 95 },
    { name: "Afternoon B", time: "14:00 – 22:00", staff: "118/120", fill: 98 },
    { name: "Night C", time: "22:00 – 06:00", staff: "45/60", fill: 75 },
  ];

  return (
    <>
      <p className="mb-3 text-sm font-semibold text-slate-900">
        Shift Coverage
      </p>
      <div className="space-y-3">
        {shifts.map((shift) => (
          <div
            key={shift.name}
            className="rounded-lg border border-border p-3"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-800">
                {shift.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {shift.staff}
              </span>
            </div>
            <p className="mb-2 text-[10px] text-muted-foreground">
              {shift.time}
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  shift.fill >= 90
                    ? "bg-green-500"
                    : shift.fill >= 80
                      ? "bg-amber-500"
                      : "bg-red-500",
                )}
                style={{ width: `${shift.fill}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
