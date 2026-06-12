import { Select } from "@/components/ui/select";
import {
  DEPARTMENTS,
  SHIFTS,
  SHIFT_LABELS,
  type Department,
  type Shift,
} from "@/lib/constants/departments";

type MonitorFiltersProps = {
  department: Department | "";
  shift: Shift | "";
  onDepartmentChange: (value: Department | "") => void;
  onShiftChange: (value: Shift | "") => void;
  className?: string;
};

export function MonitorFilters({
  department,
  shift,
  onDepartmentChange,
  onShiftChange,
  className,
}: MonitorFiltersProps) {
  return (
    <div
      className={
        className ??
        "grid w-full grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:flex sm:w-auto sm:flex-wrap"
      }
    >
      <Select
        value={department}
        onChange={(e) => onDepartmentChange(e.target.value as Department | "")}
        aria-label="Filter by department"
        className="w-full sm:min-w-[11rem] sm:max-w-xs"
      >
        <option value="">All departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Select>
      <Select
        value={shift}
        onChange={(e) => onShiftChange(e.target.value as Shift | "")}
        aria-label="Filter by shift"
        className="w-full sm:min-w-[9rem] sm:max-w-xs"
      >
        <option value="">All shifts</option>
        {SHIFTS.map((s) => (
          <option key={s} value={s}>
            {SHIFT_LABELS[s]}
          </option>
        ))}
      </Select>
    </div>
  );
}
