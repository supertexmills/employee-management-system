import { Select } from "@/components/ui/select";
import {
  DEPARTMENTS,
  SHIFTS,
  SHIFT_LABELS,
  type Department,
  type Shift,
} from "@/lib/constants/departments";
import { cn } from "@/lib/cn";

type ProductionFiltersProps = {
  department: Department | "";
  shift: Shift | "";
  machineId?: string;
  machineOptions?: { machineId: string; name: string }[];
  onDepartmentChange: (value: Department | "") => void;
  onShiftChange: (value: Shift | "") => void;
  onMachineIdChange?: (value: string) => void;
  className?: string;
};

export function ProductionFilters({
  department,
  shift,
  machineId = "",
  machineOptions = [],
  onDepartmentChange,
  onShiftChange,
  onMachineIdChange,
  className,
}: ProductionFiltersProps) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 sm:flex sm:w-auto sm:flex-wrap",
        className,
      )}
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
      {onMachineIdChange ? (
        <Select
          value={machineId}
          onChange={(e) => onMachineIdChange(e.target.value)}
          aria-label="Filter by machine"
          className="w-full sm:min-w-[10rem] sm:max-w-xs"
        >
          <option value="">All machines</option>
          {machineOptions.map((m) => (
            <option key={m.machineId} value={m.machineId}>
              {m.name}
            </option>
          ))}
        </Select>
      ) : null}
    </div>
  );
}
