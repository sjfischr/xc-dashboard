import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportCharts } from "@/components/reports/ReportCharts";
import { DownloadButtons } from "@/components/reports/DownloadButtons";
import { getSeasonRows, getMeets } from "@/lib/data/loadSeason";
import { canonicalTeam } from "@/lib/config/teams";
import {
  computeTeamScore,
  computePackGaps,
  teamsThatBeatUs,
  trendByTeam,
} from "@/lib/analytics/engine";
import type { ResultRow } from "@/lib/data/types";
import { TrendingUp, Users, Timer, Award, Target } from "lucide-react";

const OUR_TEAM = "XC Hawks";

// Regenerate this page weekly (604800 seconds = 7 days)
export const revalidate = 604800;

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function formatTime(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) {
    return "—";
  }

  const totalSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const wholeSeconds = Math.floor(secs);
  let tenths = Math.round((secs - wholeSeconds) * 10);

  let displayMinutes = minutes;
  let displaySeconds = wholeSeconds;

  if (tenths === 10) {
    tenths = 0;
    displaySeconds += 1;
    if (displaySeconds === 60) {
      displaySeconds = 0;
      displayMinutes += 1;
    }
  }

  const paddedSeconds = String(displaySeconds).padStart(2, "0");
  const decimal = tenths > 0 ? `.${tenths}` : "";
  return `${displayMinutes}:${paddedSeconds}${decimal}`;
}

function getLatestMeet(rows: ResultRow[]): string | null {
  const meets = new Map<string, string>();

  rows.forEach((row) => {
    if (normalizeKey(canonicalTeam(row.team)) === normalizeKey(OUR_TEAM)) {
      if (!meets.has(row.meet)) {
        meets.set(row.meet, row.date || "");
      }
    }
  });

  const sorted = Array.from(meets.entries())
    .filter(([, date]) => date)
    .sort((a, b) => b[1].localeCompare(a[1]));

  return sorted[0]?.[0] || null;
}

function getImprovements(
  rows: ResultRow[],
  latestMeet: string,
  previousMeet: string
): Array<{ athlete: string; improvement: number; latest: number }> {
  const latestTimes = new Map<string, number>();
  const previousTimes = new Map<string, number>();

  rows.forEach((row) => {
    if (
      normalizeKey(row.team) === normalizeKey(OUR_TEAM) &&
      row.status === "FINISHED" &&
      typeof row.timeSeconds === "number"
    ) {
      if (normalizeKey(row.meet) === normalizeKey(latestMeet)) {
        latestTimes.set(row.athlete, row.timeSeconds);
      } else if (normalizeKey(row.meet) === normalizeKey(previousMeet)) {
        previousTimes.set(row.athlete, row.timeSeconds);
      }
    }
  });

  const improvements: Array<{
    athlete: string;
    improvement: number;
    latest: number;
  }> = [];

  latestTimes.forEach((latestTime, athlete) => {
    const previousTime = previousTimes.get(athlete);
    if (previousTime) {
      const improvement = previousTime - latestTime;
      improvements.push({ athlete, improvement, latest: latestTime });
    }
  });

  return improvements.sort((a, b) => b.improvement - a.improvement);
}

export default function ReportsPage() {
  const allRows = getSeasonRows();
  const meets = getMeets();
  const latestMeet = getLatestMeet(allRows);

  if (!latestMeet) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Coach Summary Report</h1>
          <p className="text-muted-foreground">
            No meet data available for {OUR_TEAM}.
          </p>
        </header>
      </div>
    );
  }

  const meetRows = allRows.filter(
    (row) => normalizeKey(row.meet) === normalizeKey(latestMeet)
  );

  const ourScore = computeTeamScore(meetRows, latestMeet, OUR_TEAM);
  const packGaps = computePackGaps(meetRows, latestMeet, OUR_TEAM);
  const rivals = teamsThatBeatUs(meetRows, latestMeet, OUR_TEAM);

  // Get trend data
  const trendData = trendByTeam(allRows, OUR_TEAM);

  // Get improvements from previous meet
  const meetIndex = meets.findIndex(
    (m) => normalizeKey(m) === normalizeKey(latestMeet)
  );
  const previousMeet = meetIndex > 0 ? meets[meetIndex - 1] : null;
  const improvements = previousMeet
    ? getImprovements(allRows, latestMeet, previousMeet)
    : [];

  const topImprovers = improvements.slice(0, 3);

  // Get meet date
  const meetDate =
    allRows.find((r) => normalizeKey(r.meet) === normalizeKey(latestMeet))
      ?.date || "";

  // Prepare data for download
  const reportData = {
    team: OUR_TEAM,
    meet: latestMeet,
    date: meetDate,
    score: ourScore.score,
    packGap: packGaps.gap1To5Seconds,
    rivals: rivals.slice(0, 2),
    topImprovers,
    trendData,
  };

  return (
    <div className="space-y-6" id="report-content">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Coach Summary Report</h1>
          <p className="text-muted-foreground">
            {OUR_TEAM} · {latestMeet} · {meetDate}
          </p>
        </div>
        <DownloadButtons reportData={reportData} />
      </header>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Team Score */}
            <div className="flex items-start gap-3 rounded-lg border border-border p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Team Score
                </p>
                <p className="text-2xl font-bold">
                  {ourScore.score ?? "No Score"}
                </p>
                {ourScore.finisherCount < 5 && (
                  <p className="text-xs text-muted-foreground">
                    {ourScore.finisherCount}/5 finishers
                  </p>
                )}
              </div>
            </div>

            {/* Pack Gap */}
            <div className="flex items-start gap-3 rounded-lg border border-border p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pack Gap (1-5)
                </p>
                <p className="text-2xl font-bold">
                  {packGaps.gap1To5Seconds !== null
                    ? `${packGaps.gap1To5Seconds.toFixed(1)}s`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {packGaps.gap1To5Seconds !== null &&
                  packGaps.gap1To5Seconds < 30
                    ? "Excellent"
                    : packGaps.gap1To5Seconds !== null &&
                        packGaps.gap1To5Seconds < 60
                      ? "Good"
                      : "Needs Work"}
                </p>
              </div>
            </div>

            {/* Average Time */}
            <div className="flex items-start gap-3 rounded-lg border border-border p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Top-5 Time
                </p>
                <p className="text-2xl font-bold">
                  {ourScore.placements.length === 5
                    ? formatTime(
                        ourScore.placements.reduce(
                          (sum, p) => sum + (p.timeSeconds ?? 0),
                          0
                        ) / 5
                      )
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Rivals that beat us */}
          {rivals.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">
                Teams That Beat Us ({rivals.length})
              </h3>
              <div className="space-y-2">
                {rivals.slice(0, 2).map((rival) => (
                  <div
                    key={rival.opponent}
                    className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-4 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        Loss
                      </Badge>
                      <span className="font-semibold">{rival.opponent}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {rival.scoreDifference !== null && (
                        <span className="text-muted-foreground">
                          Score Δ: +{rival.scoreDifference}
                        </span>
                      )}
                      {rival.averageTimeGapSeconds !== null && (
                        <span className="text-muted-foreground">
                          Time Δ: +
                          {Math.abs(rival.averageTimeGapSeconds).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Improvers */}
          {topImprovers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">
                Biggest Improvers vs Previous Meet
              </h3>
              <div className="space-y-2">
                {topImprovers.map((athlete) => (
                  <div
                    key={athlete.athlete}
                    className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-4 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium">{athlete.athlete}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-emerald-600">
                        -{athlete.improvement.toFixed(1)}s
                      </span>
                      <span className="text-muted-foreground">
                        {formatTime(athlete.latest)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Insights */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Key Insights</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {ourScore.score === null && (
                <li>
                  • Incomplete scoring five - need {5 - ourScore.finisherCount}{" "}
                  more finishers
                </li>
              )}
              {packGaps.gap1To5Seconds !== null &&
                packGaps.gap1To5Seconds > 60 && (
                  <li>
                    • Pack spread is wide - focus on bringing up 4th and 5th
                    runners
                  </li>
                )}
              {rivals.length > 0 && (
                <li>
                  • {rivals.length} team{rivals.length > 1 ? "s" : ""} ahead of
                  us - see detailed breakdown above
                </li>
              )}
              {topImprovers.length > 0 && topImprovers[0].improvement > 10 && (
                <li>
                  • Excellent individual progress from {topImprovers[0].athlete}{" "}
                  ({topImprovers[0].improvement.toFixed(1)}s improvement)
                </li>
              )}
              {trendData.length >= 3 && (
                <li>
                  • Season trend: {trendData.length} meets completed - see
                  charts below
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {trendData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Season Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportCharts trendData={trendData} />
          </CardContent>
        </Card>
      )}

      {/* Team Roster */}
      {ourScore.placements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Finishers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ourScore.placements.map((placement, index) => (
                <div
                  key={placement.athlete}
                  className="flex items-center justify-between rounded-md border border-border px-4 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium">{placement.athlete}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Place {placement.place}</Badge>
                    <span className="font-mono text-sm">
                      {formatTime(placement.timeSeconds)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
