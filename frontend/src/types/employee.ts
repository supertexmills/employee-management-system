import type { Department, Shift } from "@/lib/constants/departments";

export type EmployeeAddress = {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type Employee = {
  _id: string;
  employeeId: string;
  profilePicture: string | null;
  employeeName: string;
  phoneNumber: string;
  department: Department;
  designation: string;
  address?: EmployeeAddress;
  joinedDate: string;
  rfid: string;
  shift: Shift;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmployeePayload = {
  employeeName: string;
  phoneNumber: string;
  department: Department;
  designation: string;
  rfid: string;
  shift: Shift;
  address?: EmployeeAddress;
  joinedDate?: string;
  profilePicture?: string | null;
};

export type UpdateEmployeePayload = Partial<
  Omit<CreateEmployeePayload, "joinedDate">
> & {
  joinedDate?: string;
  isActive?: boolean;
};
