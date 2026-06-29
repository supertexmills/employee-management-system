"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { PageSkeleton } from "@/components/ui/page-skeleton";

type HourlyDatum = { hourLabel: string; rounds: number };

const productionHourlyChartConfig = {
  rounds: {
    label: "Rounds",
    theme: {
      light: "var(--chart-1)",
      dark: "var(--chart-1)",
    },
  },
} satisfies ChartConfig;

const chartContainerClassName = "aspect-auto h-full w-full min-h-0 min-w-0";
const chartInitialDimension = { width: 400, height: 288 } as const;

export function ProductionHourlyChart({
  data,
  loading,
}: {
  data: HourlyDatum[];
  loading?: boolean;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Hourly Production</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[18rem] w-full min-w-0 p-6 pt-0">
        {loading ? (
          <PageSkeleton variant="chart" />
        ) : data.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            No hourly data available
          </div>
        ) : (
          <div className="h-72 w-full min-w-0">
            <ChartContainer
              config={productionHourlyChartConfig}
              className={chartContainerClassName}
              initialDimension={chartInitialDimension}
            >
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="roundsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis dataKey="hourLabel" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="rounds"
                  stroke="var(--chart-1)"
                  fill="url(#roundsGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
