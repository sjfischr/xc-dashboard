export interface TeamColor {
  primary: string;
  secondary: string;
}

const normalize = (value: string): string => value.trim().toLowerCase();

export const TEAM_ALIASES: Record<string, string> = {
  "xc hawks": "XC Hawks",
  hawks: "XC Hawks",
  "xc hawks varsity": "XC Hawks",
  speedsters: "Speedsters",
  "speedsters xc": "Speedsters",
  joggers: "Joggers",
  "joggers club": "Joggers",
  "all saints": "All Saints",
  "basilica of st mary": "Basilica of St Mary",
  "blessed sacrament": "Blessed Sacrament",
  "holy family": "Holy Family",
  "holy spirit": "Holy Spirit",
  nativity: "Nativity",
  oloh: "OLOH",
  "our lady of hope": "OLOH",
  "queen of angels": "Q of A",
  "q of a": "Q of A",
  "st agnes": "St Agnes",
  "st ambrose": "St Ambrose",
  "st ann": "St Ann",
  "st anthony": "St Anthony",
  "st bernadette": "St Bernadette",
  "st francis": "St Francis",
  "st james": "St James",
  "st john the evangelist": "St John the Evangelist",
  "st joseph": "St Joseph",
  "st leo": "St Leo",
  "st louis": "St Louis",
  "st luke": "St Luke",
  "st mark": "St Mark",
  "st michael": "St Michael",
  "st rita": "St Rita",
  "st theresa": "St Theresa",
  "st thomas more": "St Thomas More",
  "st veronica": "St Veronica",
};

export const TEAM_COLORS: Record<string, TeamColor> = {
  "XC Hawks": { primary: "#1d4ed8", secondary: "#60a5fa" },
  Speedsters: { primary: "#b91c1c", secondary: "#fca5a5" },
  Joggers: { primary: "#047857", secondary: "#6ee7b7" },
  "All Saints": { primary: "#8b5cf6", secondary: "#c4b5fd" },
  "Basilica of St Mary": { primary: "#d1d5db", secondary: "#9ca3af" },
  "Blessed Sacrament": { primary: "#ffffff", secondary: "#d4d4d4" },
  "Holy Family": { primary: "#800000", secondary: "#b91c1c" },
  "Holy Spirit": { primary: "#dc2626", secondary: "#f87171" },
  Nativity: { primary: "#7b1c1c", secondary: "#ef4444" },
  OLOH: { primary: "#38bdf8", secondary: "#bae6fd" },
  "Q of A": { primary: "#39ff14", secondary: "#a3ff8f" },
  "St Agnes": { primary: "#eab308", secondary: "#facc15" },
  "St Ambrose": { primary: "#dc2626", secondary: "#f87171" },
  "St Ann": { primary: "#facc15", secondary: "#fef08a" },
  "St Anthony": { primary: "#93c5fd", secondary: "#bfdbfe" },
  "St Bernadette": { primary: "#ef4444", secondary: "#fca5a5" },
  "St Francis": { primary: "#7f1d1d", secondary: "#f87171" },
  "St James": { primary: "#b91c1c", secondary: "#fca5a5" },
  "St John the Evangelist": { primary: "#800000", secondary: "#f87171" },
  "St Joseph": { primary: "#84cc16", secondary: "#bef264" },
  "St Leo": { primary: "#f97316", secondary: "#fdba74" },
  "St Louis": { primary: "#6366f1", secondary: "#a5b4fc" },
  "St Luke": { primary: "#ec4899", secondary: "#f9a8d4" },
  "St Mark": { primary: "#0ea5e9", secondary: "#bae6fd" },
  "St Michael": { primary: "#17823b", secondary: "#86efac" },
  "St Rita": { primary: "#065f46", secondary: "#34d399" },
  "St Theresa": { primary: "#f472b6", secondary: "#fbcfe8" },
  "St Thomas More": { primary: "#4169e1", secondary: "#93abff" },
  "St Veronica": { primary: "#4a0d25", secondary: "#9f1239" },
};

export function canonicalTeam(rawName: string): string {
  const trimmed = rawName?.trim() ?? "";
  if (!trimmed) {
    return "";
  }

  const key = normalize(trimmed);
  return TEAM_ALIASES[key] ?? trimmed;
}
