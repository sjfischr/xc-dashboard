import {
  TargetsPanel,
  type TargetOpponent,
  type TargetSegmentData,
} from "@/components/coach/TargetsPanel";
import { TEAM_COLORS, canonicalTeam } from "@/lib/config/teams";
import { computeTeamScore, teamsThatBeatUs } from "@/lib/analytics/engine";
import { getSeasonRows } from "@/lib/data/loadSeason";
import type { ResultRow } from "@/lib/data/types";

const PRINT_ROUTE = "/coach/targets/print";

function normalize(value: string): string {
  return (value ?? "").trim().toLowerCase();
}

function gradeKey(grade: number | null): string {
  return grade === null ? "all" : String(grade);
}

function isRowNewer(candidate: ResultRow, current: ResultRow): boolean {
  const candidateDate = Date.parse(candidate.date);
  const currentDate = Date.parse(current.date);

  if (!Number.isNaN(candidateDate) && !Number.isNaN(currentDate)) {
    if (candidateDate !== currentDate) {
      return candidateDate > currentDate;
    }
  } else if (!Number.isNaN(candidateDate)) {
    return true;
  } else if (!Number.isNaN(currentDate)) {
    return false;
  }

  return candidate.meet.localeCompare(current.meet) > 0;
}

function buildSegmentRows(
  allRows: ResultRow[],
  latestRow: ResultRow
): ResultRow[] {
  const meetKey = normalize(latestRow.meet);
  const divisionKey = normalize(latestRow.division);
  const genderKey = normalize(latestRow.gender).charAt(0);
  const referenceGrade = latestRow.grade;

  return allRows.filter((row) => {
    if (normalize(row.meet) !== meetKey) {
      return false;
    }

    if (divisionKey && normalize(row.division) !== divisionKey) {
      return false;
    }

    const candidateGenderKey = normalize(row.gender).charAt(0);
    if (genderKey && candidateGenderKey !== genderKey) {
      return false;
    }

    if (referenceGrade === null) {
      return true;
    }

    if (row.grade === null) {
      return true;
    }

    return row.grade === referenceGrade;
  });
}

function buildOpponentBadges(
  ourScore: ReturnType<typeof computeTeamScore>,
  opponentScore: ReturnType<typeof computeTeamScore>,
  scoreDiff: number | null,
  avgTimeDiff: number | null
): string[] {
  const badges = new Set<string>();

  if (scoreDiff === 0) {
    const ourSixth =
      ourScore.tieBreakers.sixth?.place ?? Number.POSITIVE_INFINITY;
    const theirSixth =
      opponentScore.tieBreakers.sixth?.place ?? Number.POSITIVE_INFINITY;
    const ourSeventh =
      ourScore.tieBreakers.seventh?.place ?? Number.POSITIVE_INFINITY;
    const theirSeventh =
      opponentScore.tieBreakers.seventh?.place ?? Number.POSITIVE_INFINITY;

    if (theirSixth < ourSixth || theirSeventh < ourSeventh) {
      badges.add("TIE");
    }
  }

  if (avgTimeDiff !== null) {
    const diffMagnitude = Math.abs(avgTimeDiff);
    if (diffMagnitude < 10) {
      badges.add("CLOSE");
    }

    if (diffMagnitude > 45) {
      badges.add("STRETCH");
    }
  }

  return Array.from(badges);
}

function buildSegmentData(
  allRows: ResultRow[],
  ourTeam: string,
  latestRow: ResultRow,
  segmentKey: string
): TargetSegmentData | null {
  const segmentRows = buildSegmentRows(allRows, latestRow);
  const opponents = teamsThatBeatUs(segmentRows, latestRow.meet, ourTeam);
  const ourScore = computeTeamScore(segmentRows, latestRow.meet, ourTeam);

  if (ourScore.score === null) {
    return {
      id: segmentKey,
      division: latestRow.division,
      gender: latestRow.gender,
      grade: latestRow.grade,
      meet: latestRow.meet,
      date: latestRow.date,
      opponents: [],
    };
  }

  const opponentRows: TargetOpponent[] = opponents.map((opponent) => {
    const opponentScore = computeTeamScore(
      segmentRows,
      latestRow.meet,
      opponent.opponent
    );

    return {
      team: opponent.opponent,
      scoreDiff: opponent.scoreDifference,
      avgTimeDiff: opponent.averageTimeGapSeconds,
      finisherCount: opponentScore.finisherCount,
      badges: buildOpponentBadges(
        ourScore,
        opponentScore,
        opponent.scoreDifference,
        opponent.averageTimeGapSeconds
      ),
      colors: TEAM_COLORS[opponent.opponent],
    };
  });

  return {
    id: segmentKey,
    division: latestRow.division,
    gender: latestRow.gender,
    grade: latestRow.grade,
    meet: latestRow.meet,
    date: latestRow.date,
    opponents: opponentRows,
  };
}

function buildSegments(
  allRows: ResultRow[],
  ourTeam: string
): TargetSegmentData[] {
  const ourRows = allRows.filter(
    (row) => normalize(canonicalTeam(row.team)) === normalize(ourTeam)
  );

  if (ourRows.length === 0) {
    return [];
  }

  const latestBySegment = new Map<string, ResultRow>();

  ourRows.forEach((row) => {
    const key = `${normalize(row.division)}::${normalize(row.gender)}::${gradeKey(row.grade)}`;
    const current = latestBySegment.get(key);

    if (!current || isRowNewer(row, current)) {
      latestBySegment.set(key, row);
    }
  });

  const segments: TargetSegmentData[] = [];

  latestBySegment.forEach((row, key) => {
    const segment = buildSegmentData(allRows, ourTeam, row, key);
    if (segment) {
      segments.push(segment);
    }
  });

  segments.sort((a, b) => {
    const divisionCompare = a.division.localeCompare(b.division);
    if (divisionCompare !== 0) {
      return divisionCompare;
    }

    const genderCompare = a.gender.localeCompare(b.gender);
    if (genderCompare !== 0) {
      return genderCompare;
    }

    const gradeA = a.grade ?? Number.POSITIVE_INFINITY;
    const gradeB = b.grade ?? Number.POSITIVE_INFINITY;
    return gradeA - gradeB;
  });

  return segments;
}

export default function CoachTargetsPage() {
  const configuredTeam = process.env.NEXT_PUBLIC_OUR_TEAM ?? "";
  const ourTeam = canonicalTeam(configuredTeam);

  if (!ourTeam) {
    return (
      <TargetsPanel
        ourTeam=""
        segments={[]}
        printHref={PRINT_ROUTE}
        emptyStateMessage="Set NEXT_PUBLIC_OUR_TEAM in your environment to see target teams."
      />
    );
  }

  const allRows = getSeasonRows();
  const segments = buildSegments(allRows, ourTeam);

  return (
    <TargetsPanel
      ourTeam={ourTeam}
      segments={segments}
      printHref={PRINT_ROUTE}
      emptyStateMessage={`No recent meets were found for ${ourTeam}.`}
    />
  );
}
