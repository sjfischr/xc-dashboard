import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

import type { ResultRow, ResultStatus, SeasonRowFilters } from "./types";

const CSV_PATH = path.join(process.cwd(), "data", "season_results.csv");
const NON_RESULT_MARKERS = new Set(["", "DNS", "NT", "N/A", "NA"]);
const DNF_MARKERS = new Set(["DNF"]);
const DQ_MARKERS = new Set(["DQ", "DISQUALIFIED"]);

let cachedRows: ResultRow[] | null = null;

interface RawCsvRow {
  meet_name?: string;
  meet_series?: string;
  division?: string;
  team_name?: string;
  "Group/Team Name"?: string;
  athlete_full_name?: string;
  "Participant Name"?: string;
  gender?: string;
  grade?: string;
  finish_time_str?: string;
  finish_time_s?: string;
  "Finish Time"?: string;
  place_overall?: string;
  season_year?: string;
  pace_str?: string;
  [key: string]: string | undefined;
}

function readCsv(): RawCsvRow[] {
  const fileContents = fs.readFileSync(CSV_PATH, "utf8");
  return parse(fileContents, {
    columns: true,
    skip_empty_lines: true,
    trim: false,
  }) as RawCsvRow[];
}

function normalizeString(value: string | undefined): string {
  return (value ?? "").trim();
}

function normalizeGender(value: string | undefined): string {
  const trimmed = normalizeString(value);
  if (!trimmed) {
    return "";
  }

  const upper = trimmed.toUpperCase();

  if (upper === "M" || upper === "F") {
    return upper;
  }

  if (upper.startsWith("BOY") || upper.startsWith("MEN")) {
    return "M";
  }

  if (upper.startsWith("GIR") || upper.startsWith("WOM")) {
    return "F";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function toResultStatus(rawTime: string): ResultStatus {
  const normalized = rawTime.trim().toUpperCase();

  if (DNF_MARKERS.has(normalized)) {
    return "DNF";
  }

  if (DQ_MARKERS.has(normalized)) {
    return "DQ";
  }

  if (NON_RESULT_MARKERS.has(normalized)) {
    return "NO_RESULT";
  }

  return "FINISHED";
}

export function timeStringToSeconds(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const sanitized = trimmed.replace(/,/g, ".");
  const parts = sanitized.split(":").map((part) => part.trim());

  if (parts.some((part) => part.length === 0)) {
    return null;
  }

  const numericParts = parts.map((part) => Number(part));

  if (numericParts.some((part) => Number.isNaN(part))) {
    return null;
  }

  let seconds = 0;
  let multiplier = 1;

  for (let index = numericParts.length - 1; index >= 0; index -= 1) {
    seconds += numericParts[index] * multiplier;
    multiplier *= 60;
  }

  if (!Number.isFinite(seconds)) {
    return null;
  }

  return Math.round(seconds * 1000) / 1000;
}

function parseInteger(value: string | undefined): number | null {
  const trimmed = normalizeString(value);
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseFloat(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return Math.round(parsed);
}

function mapRow(row: RawCsvRow): ResultRow {
  const rawTime = normalizeString(
    row.finish_time_str ?? row["Finish Time"] ?? ""
  );
  let status = toResultStatus(rawTime);
  let timeSeconds = status === "FINISHED" ? timeStringToSeconds(rawTime) : null;

  if (timeSeconds === null) {
    const parsedSeconds = Number.parseFloat(normalizeString(row.finish_time_s));
    if (!Number.isNaN(parsedSeconds)) {
      timeSeconds = Math.round(parsedSeconds * 1000) / 1000;
      if (status === "NO_RESULT") {
        status = "FINISHED";
      }
    }
  }

  const resolvedStatus: ResultStatus =
    timeSeconds === null && status === "FINISHED" ? "NO_RESULT" : status;

  return {
    meet: normalizeString(row.meet_name ?? row.meet_series ?? ""),
    date: normalizeString(row.season_year),
    division: normalizeString(row.division),
    team: normalizeString(row.team_name ?? row["Group/Team Name"] ?? ""),
    athlete: normalizeString(
      row.athlete_full_name ?? row["Participant Name"] ?? ""
    ),
    gender: normalizeGender(row.gender),
    grade: parseInteger(row.grade),
    place: parseInteger(row.place_overall),
    rawTime,
    timeSeconds,
    status: resolvedStatus,
  };
}

function ensureRows(): ResultRow[] {
  if (cachedRows) {
    return cachedRows;
  }

  const rawRows = readCsv();
  cachedRows = rawRows.map(mapRow);
  return cachedRows;
}

function normalizeComparison(value: string): string {
  return value.trim().toLowerCase();
}

function matchesFilter(
  rowValue: string,
  filterValue: string | undefined
): boolean {
  if (!filterValue) {
    return true;
  }

  return normalizeComparison(rowValue) === normalizeComparison(filterValue);
}

export function getSeasonRows(filters: SeasonRowFilters = {}): ResultRow[] {
  const rows = ensureRows();
  return rows.filter((row) => {
    if (!matchesFilter(row.meet, filters.meet)) {
      return false;
    }

    if (!matchesFilter(row.team, filters.team)) {
      return false;
    }

    if (!matchesFilter(row.division, filters.division)) {
      return false;
    }

    if (filters.gender) {
      const normalizedFilterGender = normalizeComparison(filters.gender);
      const normalizedRowGender = normalizeComparison(row.gender);
      const rowInitial = normalizedRowGender.charAt(0);
      const filterInitial = normalizedFilterGender.charAt(0);

      const gendersMatch =
        normalizedRowGender === normalizedFilterGender ||
        (rowInitial !== "" && rowInitial === filterInitial);

      if (!gendersMatch) {
        return false;
      }
    }

    if (filters.grade !== undefined) {
      const numericFilterGrade =
        typeof filters.grade === "string"
          ? parseInteger(filters.grade)
          : filters.grade;

      if (numericFilterGrade === null || row.grade !== numericFilterGrade) {
        return false;
      }
    }

    return true;
  });
}

export function getMeets(): string[] {
  const rows = ensureRows();
  return Array.from(new Set(rows.map((row) => row.meet)))
    .filter((value) => value.length > 0)
    .sort((a, b) => a.localeCompare(b));
}

export function getTeams(): string[] {
  const rows = ensureRows();
  return Array.from(new Set(rows.map((row) => row.team)))
    .filter((value) => value.length > 0)
    .sort((a, b) => a.localeCompare(b));
}

export function getDivisions(): string[] {
  const rows = ensureRows();
  return Array.from(new Set(rows.map((row) => row.division)))
    .filter((value) => value.length > 0)
    .sort((a, b) => a.localeCompare(b));
}

export function resetSeasonDataCache(): void {
  cachedRows = null;
}
