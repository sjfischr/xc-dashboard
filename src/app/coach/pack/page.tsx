import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackAnalysisCharts } from "@/components/coach/PackAnalysisCharts";
import { PackAnalysisFilters } from "@/components/coach/PackAnalysisFilters";
import { getSeasonRows, getDivisions } from "@/lib/data/loadSeason";
import { canonicalTeam } from "@/lib/config/teams";
import {
  computeTeamScore,
  computePackGaps,
  teamsThatBeatUs,
} from "@/lib/analytics/engine";
import type { ResultRow } from "@/lib/data/types";

const OUR_TEAM = "XC Hawks";

interface PageProps {
  searchParams: {
    division?: string;
    gender?: string;
    grade?: string;
    teams?: string;
  };
}

interface ChartDataPoint {
  meet: string;
  [key: string]: string | number | null;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function getMeetsByDivision(
  rows: ResultRow[],
  division: string,
  gender?: string,
  grade?: string
): Array<{ meet: string; date: string }> {
  const meets = new Map<string, string>();

  rows.forEach((row) => {
    if (normalizeKey(row.division) !== normalizeKey(division)) {
      return;
    }

    if (
      gender &&
      normalizeKey(row.gender).charAt(0) !== normalizeKey(gender).charAt(0)
    ) {
      return;
    }

    if (grade && row.grade !== Number(grade)) {
      return;
    }

    if (!meets.has(row.meet)) {
      meets.set(row.meet, row.date || "");
    }
  });

  return Array.from(meets.entries())
    .map(([meet, date]) => ({ meet, date }))
    .sort((a, b) => {
      if (a.date && b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.meet.localeCompare(b.meet);
    });
}

function getTopRivals(
  rows: ResultRow[],
  meets: Array<{ meet: string; date: string }>,
  division: string,
  gender?: string,
  grade?: string
): string[] {
  const rivalScores = new Map<string, number>();

  meets.forEach(({ meet }) => {
    const meetRows = rows.filter((row) => {
      if (normalizeKey(row.meet) !== normalizeKey(meet)) {
        return false;
      }

      if (normalizeKey(row.division) !== normalizeKey(division)) {
        return false;
      }

      if (
        gender &&
        normalizeKey(row.gender).charAt(0) !== normalizeKey(gender).charAt(0)
      ) {
        return false;
      }

      if (grade && row.grade !== Number(grade)) {
        return false;
      }

      return true;
    });

    const beatingTeams = teamsThatBeatUs(meetRows, meet, OUR_TEAM);
    beatingTeams.forEach((rival, index) => {
      const points = beatingTeams.length - index;
      rivalScores.set(
        rival.opponent,
        (rivalScores.get(rival.opponent) || 0) + points
      );
    });
  });

  return Array.from(rivalScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([team]) => team);
}

function buildChartData(
  rows: ResultRow[],
  meets: Array<{ meet: string; date: string }>,
  teams: string[],
  division: string,
  gender?: string,
  grade?: string
): { avgTimeData: ChartDataPoint[]; packGapData: ChartDataPoint[] } {
  const avgTimeData: ChartDataPoint[] = [];
  const packGapData: ChartDataPoint[] = [];

  meets.forEach(({ meet }) => {
    const meetRows = rows.filter((row) => {
      if (normalizeKey(row.meet) !== normalizeKey(meet)) {
        return false;
      }

      if (normalizeKey(row.division) !== normalizeKey(division)) {
        return false;
      }

      if (
        gender &&
        normalizeKey(row.gender).charAt(0) !== normalizeKey(gender).charAt(0)
      ) {
        return false;
      }

      if (grade && row.grade !== Number(grade)) {
        return false;
      }

      return true;
    });

    const avgTimePoint: ChartDataPoint = { meet };
    const packGapPoint: ChartDataPoint = { meet };

    teams.forEach((team) => {
      const scoreResult = computeTeamScore(meetRows, meet, team);
      const packResult = computePackGaps(meetRows, meet, team);

      let avgTime: number | null = null;
      if (scoreResult.placements.length === 5) {
        const times = scoreResult.placements
          .map((p) => p.timeSeconds)
          .filter((t): t is number => t !== null && Number.isFinite(t));

        if (times.length === 5) {
          avgTime = times.reduce((sum, t) => sum + t, 0) / 5;
        }
      }

      avgTimePoint[team] = avgTime;
      packGapPoint[team] = packResult.gap1To5Seconds;
    });

    avgTimeData.push(avgTimePoint);
    packGapData.push(packGapPoint);
  });

  return { avgTimeData, packGapData };
}

function getAvailableGenders(rows: ResultRow[]): string[] {
  const genders = new Set<string>();
  rows.forEach((row) => {
    if (row.gender) {
      genders.add(row.gender);
    }
  });
  return Array.from(genders).sort();
}

function getAvailableGrades(rows: ResultRow[]): number[] {
  const grades = new Set<number>();
  rows.forEach((row) => {
    if (row.grade !== null) {
      grades.add(row.grade);
    }
  });
  return Array.from(grades).sort((a, b) => a - b);
}

function getAvailableTeams(rows: ResultRow[]): string[] {
  const teams = new Set<string>();
  rows.forEach((row) => {
    const canonical = canonicalTeam(row.team);
    if (canonical) {
      teams.add(canonical);
    }
  });
  return Array.from(teams).sort();
}

export default function PackAnalysisPage({ searchParams }: PageProps) {
  const allRows = getSeasonRows();
  const divisions = getDivisions();
  const availableGenders = getAvailableGenders(allRows);
  const availableGrades = getAvailableGrades(allRows);
  const availableTeams = getAvailableTeams(allRows);

  const selectedDivision = searchParams.division || divisions[0] || "";
  const selectedGender = searchParams.gender;
  const selectedGrade = searchParams.grade;
  const selectedTeamsParam = searchParams.teams;

  if (!selectedDivision) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Pack Analysis</h1>
          <p className="text-muted-foreground">
            No divisions found in the dataset.
          </p>
        </header>
      </div>
    );
  }

  const meets = getMeetsByDivision(
    allRows,
    selectedDivision,
    selectedGender,
    selectedGrade
  );

  if (meets.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Pack Analysis</h1>
          <p className="text-muted-foreground">Division: {selectedDivision}</p>
        </header>
        <Suspense fallback={<div>Loading filters...</div>}>
          <PackAnalysisFilters
            divisions={divisions}
            teams={availableTeams}
            genders={availableGenders}
            grades={availableGrades}
          />
        </Suspense>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No meets found for the selected filters.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  let compareTeams: string[];
  if (selectedTeamsParam) {
    compareTeams = [selectedTeamsParam];
  } else {
    compareTeams = getTopRivals(
      allRows,
      meets,
      selectedDivision,
      selectedGender,
      selectedGrade
    );
  }

  const allTeams = [OUR_TEAM, ...compareTeams].filter(
    (team, index, array) => array.indexOf(team) === index
  );

  const { avgTimeData, packGapData } = buildChartData(
    allRows,
    meets,
    allTeams,
    selectedDivision,
    selectedGender,
    selectedGrade
  );

  const filterSummary = [
    selectedDivision,
    selectedGender ? `${selectedGender}` : null,
    selectedGrade ? `Grade ${selectedGrade}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Pack Analysis</h1>
        <p className="text-muted-foreground">{filterSummary}</p>
      </header>

      <Suspense fallback={<div>Loading filters...</div>}>
        <PackAnalysisFilters
          divisions={divisions}
          teams={availableTeams}
          genders={availableGenders}
          grades={availableGrades}
        />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>
            {OUR_TEAM} vs {compareTeams.join(", ") || "Rivals"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PackAnalysisCharts
            avgTimeData={avgTimeData}
            packGapData={packGapData}
            teams={allTeams}
            ourTeam={OUR_TEAM}
          />
        </CardContent>
      </Card>
    </div>
  );
}
