import Employee from "../../models/employee/employee.model.js";

const employeeByEpc = new Map();

export async function hydrateEmployeeCache() {
  const employees = await Employee.find({
    isActive: true,
    rfid: { $exists: true, $ne: "" },
  })
    .select("employeeId employeeName department shift rfid")
    .lean();

  employeeByEpc.clear();
  for (const emp of employees) {
    if (emp.rfid) employeeByEpc.set(emp.rfid.toUpperCase(), emp);
  }

  console.log(`Employee cache ready: ${employeeByEpc.size} RFID tags`);
}

export function refreshEmployeeInCache(employee) {
  if (employee?.rfid) {
    employeeByEpc.set(employee.rfid.toUpperCase(), employee);
  }
}

export function removeEmployeeFromCache(rfid) {
  if (rfid) employeeByEpc.delete(rfid.toUpperCase());
}

export function getEmployeeByEpc(epc) {
  return employeeByEpc.get(epc.toUpperCase());
}
