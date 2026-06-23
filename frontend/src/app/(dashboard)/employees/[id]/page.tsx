"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as employeesApi from "@/lib/api/employees";
import * as productionApi from "@/lib/api/production";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: employeeRes, isLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeesApi.getEmployee(id),
  });

  const { data: prodSummary } = useQuery({
    queryKey: ["employee-production-summary", id],
    queryFn: () => productionApi.getEmployeeProductionSummary(id),
    enabled: !!id,
  });

  const { data: roundHistory } = useQuery({
    queryKey: ["employee-round-history", id],
    queryFn: () => productionApi.getEmployeeRoundHistory(id, { limit: 10 }),
    enabled: !!id,
  });

  const employee = employeeRes?.data;
  const prod = prodSummary?.data;
  const machines = prod?.machines ?? [];
  const totalRounds = machines.reduce((sum, m) => sum + m.totalRounds, 0);
  const roundsThisHour = machines.reduce((sum, m) => sum + m.roundsThisHour, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Employee not found</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/employees")}>
          Back to employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/employees")}>
          <ArrowLeft className="size-4" />
        </Button>
        <PageHeader
          title={employee.employeeName}
          subtitle={`${employee.designation} · ${employee.department}`}
        />
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-6 p-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {employee.employeeName.slice(0, 2).toUpperCase()}
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Employee ID" value={employee.employeeId} />
            <Info label="RFID" value={employee.rfid} mono />
            <Info label="Shift" value={employee.shift} />
            <Info label="Phone" value={employee.phoneNumber} />
          </div>
          <StatusBadge status={employee.isActive ? "active" : "inactive"} />
        </CardContent>
      </Card>

      <Tabs defaultValue="production">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employee Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Info label="Department" value={employee.department} />
              <Info label="Designation" value={employee.designation} />
              <Info
                label="Joined"
                value={
                  employee.joinedDate
                    ? format(new Date(employee.joinedDate), "MMM d, yyyy")
                    : "—"
                }
              />
              <Info
                label="Address"
                value={
                  employee.address?.city
                    ? `${employee.address.city}, ${employee.address.state ?? ""}`
                    : "—"
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="mt-4 space-y-4">
          <KpiGrid>
            <KpiCard title="Total Rounds" value={totalRounds} highlighted />
            <KpiCard title="Rounds This Hour" value={roundsThisHour} />
            <KpiCard title="Machines" value={machines.length} />
            <KpiCard
              title="Factory Date"
              value={prod?.factoryDate ?? "—"}
            />
          </KpiGrid>

          {machines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Machine Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Machine</TableHead>
                      <TableHead>Shift Rounds</TableHead>
                      <TableHead>This Hour</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Achievement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {machines.map((m) => (
                      <TableRow key={m.machineId}>
                        <TableCell className="font-medium">{m.machineId}</TableCell>
                        <TableCell>{m.totalRounds}</TableCell>
                        <TableCell>{m.roundsThisHour}</TableCell>
                        <TableCell>{m.targetRoundsPerShift ?? "—"}</TableCell>
                        <TableCell>
                          {m.achievementPercent != null ? `${m.achievementPercent}%` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Rounds</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Hour</TableHead>
                    <TableHead>Shift</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(roundHistory?.data ?? []).map((round) => (
                    <TableRow key={round._id}>
                      <TableCell>
                        {format(new Date(round.detectedAt), "MMM d HH:mm")}
                      </TableCell>
                      <TableCell>{round.machineId}</TableCell>
                      <TableCell>{round.shiftHourLabel}</TableCell>
                      <TableCell className="capitalize">{round.shift}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
