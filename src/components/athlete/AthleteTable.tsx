"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AthleteTableRow {
  id: string;
  name: string;
  team: string;
  division: string;
  gender: string;
  grade: number | null;
  meetCount: number;
  averageTimeSeconds: number | null;
  bestTimeSeconds: number | null;
  latestMeet?: {
    name: string;
    date: string;
  };
}

interface AthleteTableProps {
  rows: AthleteTableRow[];
}

function formatSeconds(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  const totalSeconds = Math.max(value, 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  const wholeSeconds = Math.floor(seconds);
  const tenths = Math.round((seconds - wholeSeconds) * 10);
  const paddedSeconds = String(wholeSeconds).padStart(2, "0");
  const decimal = tenths > 0 ? `.${tenths}` : "";
  return `${minutes}:${paddedSeconds}${decimal}`;
}

function formatGrade(grade: number | null): string {
  if (grade === null) {
    return "All Grades";
  }

  return `Grade ${grade}`;
}

function formatGender(gender: string): string {
  if (!gender) {
    return "Mixed";
  }

  const normalized = gender.trim().toUpperCase();
  if (normalized === "M") {
    return "Boys";
  }

  if (normalized === "F") {
    return "Girls";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

export function AthleteTable({ rows }: AthleteTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [...rows].sort((a, b) => a.name.localeCompare(b.name));
    }

    return rows
      .filter((row) => {
        const haystack =
          `${row.name} ${row.team} ${row.division}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query, rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filtered.length} of {rows.length} athletes
        </div>
        <div className="w-full sm:w-64">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by athlete, team, or division"
            aria-label="Search athletes"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Athlete</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Division</TableHead>
            <TableHead className="text-right">Avg</TableHead>
            <TableHead className="text-right">Best</TableHead>
            <TableHead className="text-right">Meets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((athlete) => (
            <TableRow key={athlete.id}>
              <TableCell className="max-w-[220px]">
                <div className="flex flex-col">
                  <Link
                    href={`/athlete/${encodeURIComponent(athlete.id)}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {athlete.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {formatGender(athlete.gender)} ·{" "}
                    {formatGrade(athlete.grade)}
                  </div>
                  {athlete.latestMeet ? (
                    <div className="text-xs text-muted-foreground">
                      Last meet: {athlete.latestMeet.name}
                    </div>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-sm">{athlete.team}</TableCell>
              <TableCell className="text-sm">{athlete.division}</TableCell>
              <TableCell className="text-right font-mono text-sm">
                {formatSeconds(athlete.averageTimeSeconds)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {formatSeconds(athlete.bestTimeSeconds)}
              </TableCell>
              <TableCell className="text-right text-sm">
                {athlete.meetCount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
