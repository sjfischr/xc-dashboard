import { Suspense } from "react";
import { SimulatorContent } from "@/components/coach/SimulatorContent";
import { getSeasonRows, getMeets } from "@/lib/data/loadSeason";
import { canonicalTeam } from "@/lib/config/teams";
import type { ResultRow } from "@/lib/data/types";

const OUR_TEAM = "XC Hawks";

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

export default function SimulatorPage() {
  const allRows = getSeasonRows();
  const meets = getMeets();
  const teams = getAvailableTeams(allRows);

  // Serialize data for client component
  const serializedRows = JSON.parse(JSON.stringify(allRows));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Race Simulator</h1>
        <p className="text-muted-foreground">
          Adjust athlete times and see real-time impact on team scoring
        </p>
      </header>

      <Suspense fallback={<div>Loading simulator...</div>}>
        <SimulatorContent
          rows={serializedRows}
          meets={meets}
          teams={teams}
          ourTeam={OUR_TEAM}
        />
      </Suspense>
    </div>
  );
}
