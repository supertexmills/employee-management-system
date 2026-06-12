import { cn } from "@/lib/cn";

type ShowcaseMockVariant = "hero" | "attendance" | "analytics" | "shifts";

type ShowcaseMockProps = {
  variant?: ShowcaseMockVariant;
  className?: string;
};

const variantTitles: Record<ShowcaseMockVariant, string> = {
  hero: "Operations Overview",
  attendance: "Attendance Intelligence",
  analytics: "Workforce Analytics",
  shifts: "Shift Orchestration",
};

export function ShowcaseMock({
  variant = "hero",
  className,
}: ShowcaseMockProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-white",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
          F
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-900">FactoryFlow</p>
          <p className="text-[10px] text-muted-foreground">
            {variantTitles[variant]}
          </p>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active workforce", value: "1,247" },
          { label: "On shift now", value: "342" },
          { label: "Attendance today", value: "97.1%" },
          { label: "Portal users", value: "48" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-surface px-3 py-2"
          >
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-900">Recent activity</p>
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
            Live
          </span>
        </div>
        <div className="space-y-2">
          {[
            "Morning shift check-ins synced",
            "HR updated workforce records",
            "Manager reviewed portal users",
          ].map((line) => (
            <div
              key={line}
              className="rounded-md bg-surface px-3 py-2 text-[11px] text-slate-600"
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
