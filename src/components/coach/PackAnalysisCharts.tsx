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
import { TEAM_COLORS } from "@/lib/config/teams";

interface ChartDataPoint {
  meet: string;
  [key: string]: string | number | null;
}

interface PackAnalysisChartsProps {
  avgTimeData: ChartDataPoint[];
  packGapData: ChartDataPoint[];
  teams: string[];
  ourTeam: string;
}

function getTeamColor(team: string, index: number): string {
  const palette = TEAM_COLORS[team];
  if (palette) {
    return palette.primary;
  }

  const fallbackColors = [
    "#1d4ed8",
    "#b91c1c",
    "#047857",
    "#8b5cf6",
    "#ea580c",
    "#0891b2",
    "#be123c",
  ];
  return fallbackColors[index % fallbackColors.length];
}

function formatTime(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) {
    return "—";
  }

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toFixed(1).padStart(4, "0")}`;
}

export function PackAnalysisCharts({
  avgTimeData,
  packGapData,
  teams,
  ourTeam,
}: PackAnalysisChartsProps) {
  return (
    <div className="space-y-8">
      {/* Average Time Chart */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">
            Average Top-5 Time by Meet (seconds)
          </h3>
          <p className="text-sm text-muted-foreground">
            Lower values indicate faster teams. Compares your team against top
            rivals.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={avgTimeData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="meet"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{
                value: "Avg Time (seconds)",
                angle: -90,
                position: "insideLeft",
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? formatTime(value) : "—"
              }
              labelStyle={{ fontWeight: "bold" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            {teams.map((team, index) => (
              <Line
                key={team}
                type="monotone"
                dataKey={team}
                stroke={getTeamColor(team, index)}
                strokeWidth={team === ourTeam ? 3 : 2}
                dot={{ r: team === ourTeam ? 5 : 3 }}
                name={team}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pack Gap Chart */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">Pack Gap (1-5) by Meet</h3>
          <p className="text-sm text-muted-foreground">
            Time spread between 1st and 5th runner (seconds). Tighter packs are
            better.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={packGapData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="meet"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{
                value: "Gap (seconds)",
                angle: -90,
                position: "insideLeft",
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? `${value.toFixed(1)}s` : "—"
              }
              labelStyle={{ fontWeight: "bold" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            {teams.map((team, index) => (
              <Line
                key={team}
                type="monotone"
                dataKey={team}
                stroke={getTeamColor(team, index)}
                strokeWidth={team === ourTeam ? 3 : 2}
                dot={{ r: team === ourTeam ? 5 : 3 }}
                name={team}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
