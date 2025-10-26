"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrendPoint {
  meet: string;
  date: string;
  score: number | null;
  averageTop5TimeSeconds: number | null;
  packGapSeconds: number | null;
}

interface ReportChartsProps {
  trendData: TrendPoint[];
}

function formatTime(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) {
    return "—";
  }

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toFixed(1).padStart(4, "0")}`;
}

export function ReportCharts({ trendData }: ReportChartsProps) {
  return (
    <div className="space-y-8">
      {/* Average Time Trend */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Average Top-5 Time Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={trendData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="meet"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              label={{
                value: "Time (seconds)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? formatTime(value) : "—"
              }
              labelStyle={{ fontWeight: "bold", fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px", fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="averageTop5TimeSeconds"
              stroke="#1d4ed8"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Avg Top-5 Time"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pack Gap Trend */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Pack Gap (1-5) Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={trendData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="meet"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              label={{
                value: "Gap (seconds)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? `${value.toFixed(1)}s` : "—"
              }
              labelStyle={{ fontWeight: "bold", fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px", fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="packGapSeconds"
              stroke="#047857"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Pack Gap"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
