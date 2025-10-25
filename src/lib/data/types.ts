export type ResultStatus = "FINISHED" | "DNF" | "DQ" | "NO_RESULT";

export interface ResultRow {
  meet: string;
  date: string;
  division: string;
  team: string;
  athlete: string;
  gender: string;
  grade: number | null;
  place: number | null;
  rawTime: string;
  timeSeconds: number | null;
  status: ResultStatus;
}

export interface TeamMetrics {
  team: string;
  division: string;
  meet: string;
  athleteCount: number;
  averageTimeSeconds: number | null;
  bestTimeSeconds: number | null;
}

export interface AthleteMetrics {
  athlete: string;
  team: string;
  gender: string;
  grade: number | null;
  meetCount: number;
  averageTimeSeconds: number | null;
  bestTimeSeconds: number | null;
}

export interface SeasonRowFilters {
  meet?: string;
  team?: string;
  gender?: string;
  grade?: number | string;
  division?: string;
}
