"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/components/ui/page-skeleton";

type ChartDatum = { name: string; value: number };
type HourlyDatum = { hourLabel: string; rounds: number };

export function AttendanceChart({
  data,
  loading,
}: {
  data: ChartDatum[];
  loading: boolean;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[18rem] w-full min-w-0 p-6 pt-0">
        {loading ? (
          <PageSkeleton variant="chart" />
        ) : (
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProductionChart({
  data,
  loading,
}: {
  data: HourlyDatum[];
  loading: boolean;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Production by Hour</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[18rem] w-full min-w-0 p-6 pt-0">
        {loading ? (
          <PageSkeleton variant="chart" />
        ) : data.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            No production data for today
          </div>
        ) : (
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hourLabel" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="rounds" fill="#60a5fa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({
  attendanceChart,
  hourlyChart,
  attendanceLoading,
  productionLoading,
}: {
  attendanceChart: ChartDatum[];
  hourlyChart: HourlyDatum[];
  attendanceLoading: boolean;
  productionLoading: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AttendanceChart data={attendanceChart} loading={attendanceLoading} />
      <ProductionChart data={hourlyChart} loading={productionLoading} />
    </div>
  );
}
