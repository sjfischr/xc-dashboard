import { canonicalTeam } from "../config/teams";
import type { ResultRow } from "./types";

const NON_ALPHANUMERIC = /[^a-z0-9]+/g;

export interface AthleteAggregate {
  id: string;
  name: string;
  team: string;
  canonicalTeam: string;
  division: string;
  gender: string;
  grade: number | null;
  latestRow: ResultRow;
  results: ResultRow[];
}

export function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function sanitizeSlug(value: string): string {
  const normalized = normalizeKey(value);
  const slug = normalized
    .replace(NON_ALPHANUMERIC, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "na";
}

export function makeAthleteId(name: string, team: string): string {
  const nameSlug = sanitizeSlug(name);
  const teamSlug = sanitizeSlug(team);
  return `${nameSlug}--${teamSlug}`;
}

export function isRowNewer(candidate: ResultRow, baseline: ResultRow): boolean {
  const candidateDate = Date.parse(candidate.date);
  const baselineDate = Date.parse(baseline.date);

  if (!Number.isNaN(candidateDate) && !Number.isNaN(baselineDate)) {
    if (candidateDate !== baselineDate) {
      return candidateDate > baselineDate;
    }
  } else if (!Number.isNaN(candidateDate)) {
    return true;
  } else if (!Number.isNaN(baselineDate)) {
    return false;
  }

  return candidate.meet.localeCompare(baseline.meet) > 0;
}

export function buildAthleteIndex(
  rows: ResultRow[]
): Map<string, AthleteAggregate> {
  const index = new Map<string, AthleteAggregate>();

  rows.forEach((row) => {
    const trimmedName = row.athlete.trim();
    if (!trimmedName) {
      return;
    }

    const resolvedTeam = canonicalTeam(row.team) || row.team;
    const id = makeAthleteId(trimmedName, resolvedTeam);
    const existing = index.get(id);

    if (!existing) {
      index.set(id, {
        id,
        name: trimmedName,
        team: row.team,
        canonicalTeam: resolvedTeam,
        division: row.division,
        gender: row.gender,
        grade: row.grade,
        latestRow: row,
        results: [row],
      });
      return;
    }

    existing.results.push(row);

    if (isRowNewer(row, existing.latestRow)) {
      existing.latestRow = row;
      existing.division = row.division;
      existing.gender = row.gender;
      if (row.grade !== null) {
        existing.grade = row.grade;
      }
      existing.team = row.team;
      existing.canonicalTeam = resolvedTeam;
    }
  });

  return index;
}

export function sortResultsChronologically(results: ResultRow[]): ResultRow[] {
  return [...results].sort((a, b) => {
    const aDate = Date.parse(a.date);
    const bDate = Date.parse(b.date);

    if (!Number.isNaN(aDate) && !Number.isNaN(bDate) && aDate !== bDate) {
      return aDate - bDate;
    }

    if (!Number.isNaN(aDate)) {
      return -1;
    }

    if (!Number.isNaN(bDate)) {
      return 1;
    }

    if (a.meet !== b.meet) {
      return a.meet.localeCompare(b.meet);
    }

    const aTime = a.timeSeconds ?? Number.POSITIVE_INFINITY;
    const bTime = b.timeSeconds ?? Number.POSITIVE_INFINITY;
    if (aTime !== bTime) {
      return aTime - bTime;
    }

    return a.athlete.localeCompare(b.athlete);
  });
}

export function uniqueMeets(results: ResultRow[]): ResultRow[] {
  const byMeet = new Map<string, ResultRow>();

  results.forEach((row) => {
    const key = `${normalizeKey(row.meet)}::${row.date}`;
    const existing = byMeet.get(key);

    if (!existing) {
      byMeet.set(key, row);
      return;
    }

    if (row.status === "FINISHED" && existing.status !== "FINISHED") {
      byMeet.set(key, row);
      return;
    }

    if (
      row.status === "FINISHED" &&
      existing.status === "FINISHED" &&
      (row.timeSeconds ?? Number.POSITIVE_INFINITY) <
        (existing.timeSeconds ?? Number.POSITIVE_INFINITY)
    ) {
      byMeet.set(key, row);
      return;
    }

    if (isRowNewer(row, existing)) {
      byMeet.set(key, row);
    }
  });

  return Array.from(byMeet.values());
}
