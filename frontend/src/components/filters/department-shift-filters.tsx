"use client";

import { FilterBar } from "@/components/dashboard/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS, SHIFTS } from "@/lib/constants";
import { formatShift } from "@/lib/utils";

type DepartmentShiftFiltersProps = {
  department: string;
  shift: string;
  onDepartmentChange: (value: string) => void;
  onShiftChange: (value: string) => void;
  includeAllDepartments?: boolean;
  includeAllShifts?: boolean;
  departmentWidth?: string;
  shiftWidth?: string;
};

export function DepartmentShiftFilters({
  department,
  shift,
  onDepartmentChange,
  onShiftChange,
  includeAllDepartments = true,
  includeAllShifts = true,
  departmentWidth = "w-44",
  shiftWidth = "w-36",
}: DepartmentShiftFiltersProps) {
  return (
    <FilterBar>
      <Select value={department} onValueChange={(v) => v && onDepartmentChange(v)}>
        <SelectTrigger className={departmentWidth}>
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          {includeAllDepartments && (
            <SelectItem value="all">All Departments</SelectItem>
          )}
          {DEPARTMENTS.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={shift} onValueChange={(v) => v && onShiftChange(v)}>
        <SelectTrigger className={shiftWidth}>
          <SelectValue placeholder="Shift" />
        </SelectTrigger>
        <SelectContent>
          {includeAllShifts && <SelectItem value="all">All Shifts</SelectItem>}
          {SHIFTS.map((s) => (
            <SelectItem key={s} value={s}>
              {formatShift(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
