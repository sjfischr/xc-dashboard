import {
  AthleteTable,
  type AthleteTableRow,
} from "@/components/athlete/AthleteTable";
import {
  buildAthleteIndex,
  sortResultsChronologically,
  uniqueMeets,
} from "@/lib/data/athletes";
import { getSeasonRows } from "@/lib/data/loadSeason";

function buildTableRows(): AthleteTableRow[] {
  const rows = getSeasonRows();
  const index = buildAthleteIndex(rows);

  return Array.from(index.values()).map((athlete) => {
    const meetRows = uniqueMeets(athlete.results);
    const sorted = sortResultsChronologically(meetRows);
    const times = sorted.filter(
      (row) =>
        typeof row.timeSeconds === "number" && Number.isFinite(row.timeSeconds)
    );

    const averageTimeSeconds =
      times.length > 0
        ? times.reduce((sum, row) => sum + (row.timeSeconds as number), 0) /
          times.length
        : null;

    const bestTimeSeconds =
      times.length > 0
        ? Math.min(...times.map((row) => row.timeSeconds as number))
        : null;

    const latestMeet = sorted[sorted.length - 1];

    return {
      id: athlete.id,
      name: athlete.name,
      team: athlete.canonicalTeam,
      division: athlete.division,
      gender: athlete.gender,
      grade: athlete.grade,
      meetCount: new Set(sorted.map((row) => row.meet)).size,
      averageTimeSeconds,
      bestTimeSeconds,
      latestMeet: latestMeet
        ? {
            name: latestMeet.meet,
            date: latestMeet.date,
          }
        : undefined,
    } satisfies AthleteTableRow;
  });
}

export default function AthleteIndexPage() {
  const tableRows = buildTableRows();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Athlete Directory
        </h1>
        <p className="text-sm text-muted-foreground">
          Explore season results, compare times, and drill into detailed rival
          analysis for each runner.
        </p>
      </header>
      <AthleteTable rows={tableRows} />
    </div>
  );
}
