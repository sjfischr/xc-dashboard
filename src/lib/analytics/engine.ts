import type { ResultRow } from "../data/types";
import { canonicalTeam } from "../config/teams";

const DEFAULT_TOP_N = 5;

export interface TeamScoreOptions {
  topN?: number;
}

export interface TeamPlacementDetail {
  athlete: string;
  place: number;
  timeSeconds: number | null;
}

export interface TeamScoreResult {
  meet: string;
  team: string;
  topN: number;
  score: number | null;
  placements: TeamPlacementDetail[];
  finisherCount: number;
  tieBreakers: {
    sixth?: TeamPlacementDetail;
    seventh?: TeamPlacementDetail;
  };
}

export interface PackGapResult {
  gap1To5Seconds: number | null;
  gap1To7Seconds: number | null;
  top5StdDevSeconds: number | null;
}

export interface RivalWindowOptions {
  windowSec?: number;
}

export interface RivalDetail {
  athlete: string;
  team: string;
  deltaSeconds: number;
  timeSeconds: number;
  place: number | null;
}

export interface RivalLookupResult {
  athlete: string;
  team: string;
  timeSeconds: number | null;
  rivals: RivalDetail[];
  windowSeconds: number;
}

export interface RivalSummary {
  opponent: string;
  averageTimeGapSeconds: number | null;
  scoreDifference: number | null;
}

export interface TeamTrendPoint {
  meet: string;
  date: string;
  score: number | null;
  averageTop5TimeSeconds: number | null;
  packGapSeconds: number | null;
}

function normalizeValue(value: string): string {
  return (value ?? "").trim().toLowerCase();
}

function isFinisher(row: ResultRow): row is ResultRow & { place: number } {
  return (
    row.status === "FINISHED" &&
    row.place !== null &&
    Number.isFinite(row.place)
  );
}

function compareByPlace(
  a: ResultRow & { place: number },
  b: ResultRow & { place: number }
): number {
  if (a.place !== b.place) {
    return a.place - b.place;
  }

  const timeA = a.timeSeconds ?? Number.POSITIVE_INFINITY;
  const timeB = b.timeSeconds ?? Number.POSITIVE_INFINITY;
  if (timeA !== timeB) {
    return timeA - timeB;
  }

  return a.athlete.localeCompare(b.athlete);
}

function getTeamFinishers(
  rows: ResultRow[],
  meetId: string,
  teamName: string
): Array<ResultRow & { place: number }> {
  const meetKey = normalizeValue(meetId);
  const canonical = canonicalTeam(teamName);
  const teamKey = normalizeValue(canonical);

  return rows
    .filter((row) => normalizeValue(row.meet) === meetKey)
    .filter((row) => normalizeValue(canonicalTeam(row.team)) === teamKey)
    .filter(isFinisher)
    .map((row) => ({ ...row, place: row.place as number }))
    .sort(compareByPlace);
}

function sumPlacements(placements: TeamPlacementDetail[]): number {
  return placements.reduce((total, current) => total + current.place, 0);
}

function averageTimeFromPlacements(
  placements: TeamPlacementDetail[]
): number | null {
  if (placements.length === 0) {
    return null;
  }

  const times = placements
    .map((placement) => placement.timeSeconds)
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value)
    );

  if (times.length !== placements.length) {
    return null;
  }

  const total = times.reduce((sum, time) => sum + time, 0);
  return total / times.length;
}

function computeStandardDeviation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) /
    values.length;
  return Math.sqrt(variance);
}

function compareTeamScores(a: TeamScoreResult, b: TeamScoreResult): number {
  if (a.score === null && b.score === null) {
    return normalizeValue(a.team).localeCompare(normalizeValue(b.team));
  }

  if (a.score === null) {
    return 1;
  }

  if (b.score === null) {
    return -1;
  }

  if (a.score !== b.score) {
    return a.score - b.score;
  }

  const sixthDiff =
    (a.tieBreakers.sixth?.place ?? Number.POSITIVE_INFINITY) -
    (b.tieBreakers.sixth?.place ?? Number.POSITIVE_INFINITY);
  if (sixthDiff !== 0) {
    return sixthDiff;
  }

  const seventhDiff =
    (a.tieBreakers.seventh?.place ?? Number.POSITIVE_INFINITY) -
    (b.tieBreakers.seventh?.place ?? Number.POSITIVE_INFINITY);
  if (seventhDiff !== 0) {
    return seventhDiff;
  }

  const maxLength = Math.max(a.placements.length, b.placements.length);
  for (let index = 0; index < maxLength; index += 1) {
    const aPlace = a.placements[index]?.place ?? Number.POSITIVE_INFINITY;
    const bPlace = b.placements[index]?.place ?? Number.POSITIVE_INFINITY;
    if (aPlace !== bPlace) {
      return aPlace - bPlace;
    }
  }

  return normalizeValue(a.team).localeCompare(normalizeValue(b.team));
}

export function computeTeamScore(
  rows: ResultRow[],
  meetId: string,
  teamName: string,
  options: TeamScoreOptions = {}
): TeamScoreResult {
  const topN = options.topN ?? DEFAULT_TOP_N;
  const canonical = canonicalTeam(teamName);
  const finishers = getTeamFinishers(rows, meetId, canonical);

  const placements = finishers.slice(0, topN).map((row) => ({
    athlete: row.athlete,
    place: row.place,
    timeSeconds: row.timeSeconds ?? null,
  }));

  const sixthRow = finishers[topN];
  const seventhRow = finishers[topN + 1];

  return {
    meet: meetId,
    team: canonical,
    topN,
    score: placements.length === topN ? sumPlacements(placements) : null,
    placements,
    finisherCount: finishers.length,
    tieBreakers: {
      sixth: sixthRow
        ? {
            athlete: sixthRow.athlete,
            place: sixthRow.place,
            timeSeconds: sixthRow.timeSeconds ?? null,
          }
        : undefined,
      seventh: seventhRow
        ? {
            athlete: seventhRow.athlete,
            place: seventhRow.place,
            timeSeconds: seventhRow.timeSeconds ?? null,
          }
        : undefined,
    },
  };
}

export function computePackGaps(
  rows: ResultRow[],
  meetId: string,
  teamName: string
): PackGapResult {
  const finishers = getTeamFinishers(rows, meetId, canonicalTeam(teamName))
    .filter(
      (row) =>
        typeof row.timeSeconds === "number" && Number.isFinite(row.timeSeconds)
    )
    .sort((a, b) => {
      const timeDiff = (a.timeSeconds as number) - (b.timeSeconds as number);
      if (timeDiff !== 0) {
        return timeDiff;
      }

      return a.place - b.place;
    });

  const topFive = finishers.slice(0, 5);
  const topSeven = finishers.slice(0, 7);

  const gap1To5Seconds =
    topFive.length === 5
      ? (topFive[4].timeSeconds as number) - (topFive[0].timeSeconds as number)
      : null;

  const gap1To7Seconds =
    topSeven.length === 7
      ? (topSeven[6].timeSeconds as number) -
        (topSeven[0].timeSeconds as number)
      : null;

  const top5StdDevSeconds =
    topFive.length === 5
      ? computeStandardDeviation(
          topFive.map((row) => row.timeSeconds as number)
        )
      : null;

  return {
    gap1To5Seconds,
    gap1To7Seconds,
    top5StdDevSeconds,
  };
}

export function nearestRivalsByAthlete(
  rows: ResultRow[],
  meetId: string,
  athleteName: string,
  options: RivalWindowOptions = {}
): RivalLookupResult {
  const windowSeconds = Math.max(options.windowSec ?? 10, 0);
  const meetKey = normalizeValue(meetId);
  const athleteKey = normalizeValue(athleteName);

  const meetRows = rows
    .filter((row) => normalizeValue(row.meet) === meetKey)
    .filter(
      (row) =>
        row.status === "FINISHED" &&
        typeof row.timeSeconds === "number" &&
        Number.isFinite(row.timeSeconds)
    );

  const target = meetRows
    .filter((row) => normalizeValue(row.athlete) === athleteKey)
    .sort((a, b) => a.timeSeconds! - b.timeSeconds!)[0];

  if (!target || typeof target.timeSeconds !== "number") {
    return {
      athlete: athleteName,
      team: "",
      timeSeconds: null,
      rivals: [],
      windowSeconds,
    };
  }

  const targetTeamCanonical = canonicalTeam(target.team);
  const targetTeamKey = normalizeValue(targetTeamCanonical);

  const rivals = meetRows
    .filter((row) => normalizeValue(canonicalTeam(row.team)) !== targetTeamKey)
    .map((row) => {
      const deltaSeconds = (row.timeSeconds as number) - target.timeSeconds!;
      return {
        athlete: row.athlete,
        team: canonicalTeam(row.team),
        deltaSeconds,
        timeSeconds: row.timeSeconds as number,
        place: row.place ?? null,
      };
    })
    .filter((entry) => Math.abs(entry.deltaSeconds) <= windowSeconds)
    .sort((a, b) => {
      const magnitudeDiff = Math.abs(a.deltaSeconds) - Math.abs(b.deltaSeconds);
      if (magnitudeDiff !== 0) {
        return magnitudeDiff;
      }

      if (a.deltaSeconds !== b.deltaSeconds) {
        return a.deltaSeconds - b.deltaSeconds;
      }

      return a.athlete.localeCompare(b.athlete);
    });

  return {
    athlete: target.athlete,
    team: targetTeamCanonical,
    timeSeconds: target.timeSeconds,
    rivals,
    windowSeconds,
  };
}

export function teamsThatBeatUs(
  rows: ResultRow[],
  meetId: string,
  teamName: string,
  options: TeamScoreOptions = {}
): RivalSummary[] {
  const meetKey = normalizeValue(meetId);
  const canonical = canonicalTeam(teamName);
  const teamKey = normalizeValue(canonical);

  const meetRows = rows.filter((row) => normalizeValue(row.meet) === meetKey);
  if (meetRows.length === 0) {
    return [];
  }

  const teams = new Map<string, string>();
  meetRows.forEach((row) => {
    const canonicalRowTeam = canonicalTeam(row.team);
    const normalized = normalizeValue(canonicalRowTeam);
    if (normalized && !teams.has(normalized)) {
      teams.set(normalized, canonicalRowTeam);
    }
  });

  if (!teams.has(teamKey)) {
    return [];
  }

  const topN = options.topN ?? DEFAULT_TOP_N;
  const teamResults = new Map<string, TeamScoreResult>();
  teams.forEach((displayName, normalized) => {
    teamResults.set(
      normalized,
      computeTeamScore(meetRows, meetId, displayName, options)
    );
  });

  const ourResult = teamResults.get(teamKey);
  if (!ourResult || ourResult.score === null) {
    return [];
  }

  const beatingOpponents = Array.from(teamResults.entries())
    .filter(([normalized]) => normalized !== teamKey)
    .map(([, result]) => result)
    .filter((result) => compareTeamScores(result, ourResult) < 0);

  const sortedOpponents = beatingOpponents.sort(compareTeamScores);

  return sortedOpponents.map((result) => {
    const opponentAverage =
      result.placements.length === topN
        ? averageTimeFromPlacements(result.placements)
        : null;
    const ourAverage =
      ourResult.placements.length === topN
        ? averageTimeFromPlacements(ourResult.placements)
        : null;

    return {
      opponent: result.team,
      averageTimeGapSeconds:
        ourAverage !== null && opponentAverage !== null
          ? ourAverage - opponentAverage
          : null,
      scoreDifference:
        result.score !== null ? ourResult.score! - result.score : null,
    };
  });
}

export function trendByTeam(
  rows: ResultRow[],
  teamName: string,
  options: TeamScoreOptions = {}
): TeamTrendPoint[] {
  const canonical = canonicalTeam(teamName);
  const teamKey = normalizeValue(canonical);
  const meets = new Map<string, { date: string }>();

  rows.forEach((row) => {
    if (normalizeValue(canonicalTeam(row.team)) === teamKey) {
      if (!meets.has(row.meet)) {
        meets.set(row.meet, { date: row.date });
      } else if (!meets.get(row.meet)?.date && row.date) {
        meets.set(row.meet, { date: row.date });
      }
    }
  });

  const topN = options.topN ?? DEFAULT_TOP_N;

  const points = Array.from(meets.entries()).map(([meet, meta]) => {
    const scoreResult = computeTeamScore(rows, meet, canonical, options);
    const packResult = computePackGaps(rows, meet, canonical);

    const averageTop5TimeSeconds =
      scoreResult.placements.length === topN
        ? averageTimeFromPlacements(scoreResult.placements)
        : null;

    return {
      meet,
      date: meta.date ?? "",
      score: scoreResult.score,
      averageTop5TimeSeconds,
      packGapSeconds: packResult.gap1To5Seconds,
    };
  });

  points.sort((a, b) => {
    if (a.date && b.date) {
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) {
        return dateComparison;
      }
    } else if (a.date) {
      return -1;
    } else if (b.date) {
      return 1;
    }

    return a.meet.localeCompare(b.meet);
  });

  return points;
}
