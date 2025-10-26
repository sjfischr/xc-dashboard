"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

export interface SparklineDatum {
  key: string;
  label: string;
  seconds: number;
  formatted: string;
}

interface AthleteSparklineProps {
  data: SparklineDatum[];
}

type ChartTooltipProps = TooltipProps<ValueType, NameType> & {
  payload?: Array<{ payload: SparklineDatum & { seconds: number } }>;
};

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0]?.payload;

  if (!point) {
    return null;
  }

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow">
      <div className="font-semibold">{point.label}</div>
      <div className="text-muted-foreground">{point.formatted}</div>
    </div>
  );
}

export function AthleteSparkline({ data }: AthleteSparklineProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
        No time data available yet.
      </div>
    );
  }

  const chartData = data.map((datum, index) => ({
    ...datum,
    index,
  }));

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 12, bottom: 8, left: 8, right: 8 }}
        >
          <XAxis
            dataKey="label"
            hide
            type="category"
            interval={0}
            tick={{ fontSize: 10 }}
          />
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="seconds"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 2.5, strokeWidth: 1 }}
            activeDot={{ r: 4 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
