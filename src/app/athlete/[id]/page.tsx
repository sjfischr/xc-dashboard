import { notFound } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Minus, Trophy } from "lucide-react";

import { AthleteSparkline } from "@/components/athlete/AthleteSparkline";
import { ShareButton } from "@/components/common/ShareButton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TEAM_COLORS, canonicalTeam } from "@/lib/config/teams";
import {
  buildAthleteIndex,
  normalizeKey,
  sortResultsChronologically,
  uniqueMeets,
} from "@/lib/data/athletes";
import { getSeasonRows } from "@/lib/data/loadSeason";
import type { ResultRow } from "@/lib/data/types";
import {
  computeTeamScore,
  nearestRivalsByAthlete,
  teamsThatBeatUs,
} from "@/lib/analytics/engine";

type MeetDirection = "faster" | "slower" | "even";

type RivalSummary = {
  athlete: string;
  team: string;
  deltaSeconds: number;
  timeSeconds: number;
  place: number | null;
};

type MeetDetails = {
  key: string;
  meet: string;
  date: string;
  formattedDate: string;
  status: ResultRow["status"];
  timeSeconds: number | null;
  timeLabel: string;
  deltaSeconds: number | null;
  deltaLabel: string | null;
  deltaDirection: MeetDirection;
  topOpponents: string[];
  rivals: RivalSummary[];
};

const WINDOW_SECONDS = 10;

function formatDateLabel(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(parsed));
}

function shortDateLabel(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(parsed));
}

function formatSeconds(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  const totalSeconds = Math.max(value, 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  const wholeSeconds = Math.floor(seconds);
  let tenths = Math.round((seconds - wholeSeconds) * 10);

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

function formatDelta(value: number | null): string | null {
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}s`;
}

function deltaDirection(value: number | null): MeetDirection {
  if (value === null || Number.isNaN(value)) {
    return "even";
  }

  if (Math.abs(value) < 0.1) {
    return "even";
  }

  return value < 0 ? "faster" : "slower";
}

function filterMeetRows(
  allRows: ResultRow[],
  reference: ResultRow
): ResultRow[] {
  const meetKey = normalizeKey(reference.meet);
  const divisionKey = normalizeKey(reference.division);
  const genderKey = normalizeKey(reference.gender).charAt(0);
  const grade = reference.grade;

  return allRows.filter((row) => {
    if (normalizeKey(row.meet) !== meetKey) {
      return false;
    }

    if (divisionKey && normalizeKey(row.division) !== divisionKey) {
      return false;
    }

    const rowGender = normalizeKey(row.gender).charAt(0);
    if (genderKey && rowGender !== genderKey) {
      return false;
    }

    if (grade === null || row.grade === null) {
      return true;
    }

    return row.grade === grade;
  });
}

function buildMeetDetails(
  allRows: ResultRow[],
  athleteName: string,
  athleteTeam: string,
  meets: ResultRow[]
): MeetDetails[] {
  const results: MeetDetails[] = [];
  let previousTime: number | null = null;

  meets.forEach((entry) => {
    const meetRows = filterMeetRows(allRows, entry);
    const topOpponents = teamsThatBeatUs(meetRows, entry.meet, athleteTeam).map(
      (opponent) => opponent.opponent
    );
    const opponentSet = new Set(topOpponents);

    const rivalLookup = nearestRivalsByAthlete(
      meetRows,
      entry.meet,
      athleteName,
      {
        windowSec: WINDOW_SECONDS,
      }
    );

    let rivals = rivalLookup.rivals;
    if (opponentSet.size > 0) {
      rivals = rivals.filter((rival) => opponentSet.has(rival.team));
      if (rivals.length === 0) {
        rivals = rivalLookup.rivals.slice(0, 3);
      }
    } else {
      rivals = rivals.slice(0, 3);
    }

    const timeSeconds =
      entry.status === "FINISHED" && typeof entry.timeSeconds === "number"
        ? entry.timeSeconds
        : null;

    const deltaSeconds =
      timeSeconds !== null && previousTime !== null
        ? timeSeconds - previousTime
        : null;

    if (timeSeconds !== null) {
      previousTime = timeSeconds;
    }

    results.push({
      key: `${entry.meet}::${entry.date}`,
      meet: entry.meet,
      date: entry.date,
      formattedDate: formatDateLabel(entry.date),
      status: entry.status,
      timeSeconds,
      timeLabel: formatSeconds(timeSeconds),
      deltaSeconds,
      deltaLabel: formatDelta(deltaSeconds),
      deltaDirection: deltaDirection(deltaSeconds),
      topOpponents,
      rivals: rivals.map((rival) => ({
        athlete: rival.athlete,
        team: rival.team,
        deltaSeconds: rival.deltaSeconds,
        timeSeconds: rival.timeSeconds,
        place: rival.place,
      })),
    });
  });

  return results;
}

function buildSparkline(meets: ResultRow[]) {
  return meets
    .filter(
      (row) =>
        typeof row.timeSeconds === "number" && Number.isFinite(row.timeSeconds)
    )
    .map((row) => ({
      key: `${row.meet}::${row.date}`,
      label: shortDateLabel(row.date),
      seconds: row.timeSeconds as number,
      formatted: formatSeconds(row.timeSeconds as number),
    }));
}

function DeltaBadge({
  direction,
  label,
}: {
  direction: MeetDirection;
  label: string | null;
}) {
  if (!label) {
    return null;
  }

  if (direction === "even") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="size-4" /> {label}
      </span>
    );
  }

  const isFaster = direction === "faster";

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${
        isFaster ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      {isFaster ? (
        <ArrowDownRight className="size-4" />
      ) : (
        <ArrowUpRight className="size-4" />
      )}
      {label}
    </span>
  );
}

function TeamChip({ team }: { team: string }) {
  const palette = TEAM_COLORS[team];

  if (!palette) {
    return <span className="text-sm font-semibold">{team}</span>;
  }

  return (
    <span className="flex items-center gap-2">
      <span
        className="h-3 w-3 rounded-full"
        aria-hidden
        style={{
          backgroundColor: palette.primary,
          boxShadow: `0 0 0 2px ${palette.secondary}`,
        }}
      />
      <span className="text-sm font-semibold leading-tight">{team}</span>
    </span>
  );
}

interface PageProps {
  params: { id: string };
}

export default function AthleteDetailPage({ params }: PageProps) {
  const athleteId = decodeURIComponent(params.id);
  const allRows = getSeasonRows();
  const index = buildAthleteIndex(allRows);
  const athlete = index.get(athleteId);

  if (!athlete) {
    notFound();
  }

  const meetRows = uniqueMeets(athlete.results);
  const sortedMeets = sortResultsChronologically(meetRows);
  if (sortedMeets.length === 0) {
    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{athlete.name}</h1>
          <p className="text-sm text-muted-foreground">
            We have not recorded any meet results for this athlete yet.
          </p>
        </header>
      </div>
    );
  }

  const sparklineData = buildSparkline(sortedMeets);
  const meetDetails = buildMeetDetails(
    allRows,
    athlete.name,
    canonicalTeam(athlete.team) || athlete.canonicalTeam,
    sortedMeets
  );

  const latestResult = athlete.latestRow;
  const divisionLabel = latestResult.division || "Unassigned";

  const scoringContext = computeTeamScore(
    filterMeetRows(allRows, sortedMeets[sortedMeets.length - 1]),
    sortedMeets[sortedMeets.length - 1].meet,
    athlete.canonicalTeam
  );

  const scoringSummary =
    scoringContext.score !== null
      ? `Team scored ${scoringContext.score} in this segment`
      : "Team did not post a scoring five here";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <TeamChip team={athlete.canonicalTeam} />
            <span>Division: {divisionLabel}</span>
            {athlete.gender ? <span>Gender: {athlete.gender}</span> : null}
            {athlete.grade ? <span>Grade: {athlete.grade}</span> : null}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {athlete.name}
          </h1>
          <p className="text-sm text-muted-foreground">{scoringSummary}</p>
        </div>
        <ShareButton variant="outline" />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>
            Race times across the season (lower is faster).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AthleteSparkline data={sparklineData} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="size-5" /> Meet Rival Focus
        </h2>
        <div className="grid gap-4">
          {meetDetails.map((meet) => (
            <Card key={meet.key} className="border-border/70">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-lg">{meet.meet}</CardTitle>
                  <CardDescription>{meet.formattedDate}</CardDescription>
                  {meet.status !== "FINISHED" ? (
                    <Badge variant="outline" className="mt-2 uppercase">
                      {meet.status.replace("_", " ")}
                    </Badge>
                  ) : null}
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold">{meet.timeLabel}</div>
                  <DeltaBadge
                    direction={meet.deltaDirection}
                    label={meet.deltaLabel}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {meet.topOpponents.length > 0 ? (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    Top opponents:{" "}
                    {meet.topOpponents.map((team) => (
                      <Badge
                        key={team}
                        variant="secondary"
                        className="uppercase"
                      >
                        {team}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No scoring opponents finished ahead in this segment.
                  </div>
                )}
                {meet.rivals.length > 0 ? (
                  <div className="space-y-3">
                    {meet.rivals.map((rival) => (
                      <div
                        key={`${meet.key}-${rival.athlete}`}
                        className="flex flex-col gap-2 rounded-md border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">
                            {rival.athlete}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {rival.team} · Place {rival.place ?? "—"}
                          </span>
                        </div>
                        <div className="text-right text-sm font-mono">
                          {formatSeconds(rival.timeSeconds)}
                          <div className="text-xs text-muted-foreground">
                            Δ {rival.deltaSeconds > 0 ? "+" : ""}
                            {rival.deltaSeconds.toFixed(1)}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                    No rivals within {WINDOW_SECONDS}s window for this meet.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
