import fs from "node:fs";

import {
  getDivisions,
  getMeets,
  getSeasonRows,
  getTeams,
  resetSeasonDataCache,
  timeStringToSeconds,
} from "@/lib/data/loadSeason";

const SAMPLE_MEET = "NVJCYO Cross Country Developmental Meet 1";

beforeEach(() => {
  resetSeasonDataCache();
});

describe("timeStringToSeconds", () => {
  it("parses minute-second strings into seconds", () => {
    expect(timeStringToSeconds("18:24.5")).toBeCloseTo(1104.5);
  });

  it("parses hour-minute-second strings", () => {
    expect(timeStringToSeconds("1:02:03.7")).toBeCloseTo(3723.7);
  });

  it("returns null for edge-case values", () => {
    expect(timeStringToSeconds("")).toBeNull();
    expect(timeStringToSeconds("DNF")).toBeNull();
    expect(timeStringToSeconds("DQ")).toBeNull();
    expect(timeStringToSeconds("abc")).toBeNull();
  });
});

describe("getSeasonRows", () => {
  it("loads and normalizes CSV data", () => {
    const rows = getSeasonRows();
    expect(rows.length).toBeGreaterThan(0);

    const jonathan = rows.find((row) => row.athlete === "Jonathan Biegel");
    expect(jonathan).toBeDefined();

    expect(jonathan?.meet).toBe(SAMPLE_MEET);
    expect(jonathan?.team).toBe("Basilica of St Mary");
    expect(jonathan?.status).toBe("FINISHED");
    expect(jonathan?.timeSeconds).toBeCloseTo(658.94, 2);
  });

  it("filters rows by multiple attributes", () => {
    const filtered = getSeasonRows({
      team: "St Louis",
      gender: "Female",
      division: "Frosh",
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((row) => row.team === "St Louis")).toBe(true);
    expect(filtered.every((row) => row.gender.startsWith("F"))).toBe(true);
    expect(filtered.every((row) => row.division === "Frosh")).toBe(true);
  });
});

describe("collection helpers", () => {
  it("returns meet names including known events", () => {
    const meets = getMeets();
    expect(meets.length).toBeGreaterThan(0);
    expect(meets).toContain(SAMPLE_MEET);
  });

  it("returns unique teams", () => {
    const teams = getTeams();
    expect(teams.length).toBeGreaterThan(0);
    expect(teams).toContain("St Louis");
    expect(teams).toContain("Basilica of St Mary");
  });

  it("returns unique divisions", () => {
    const divisions = getDivisions();
    expect(divisions.length).toBeGreaterThan(0);
    expect(divisions).toContain("Frosh");
    expect(divisions).toContain("Varsity");
  });
});

describe("edge case parsing", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetSeasonDataCache();
  });

  it("handles DNF, DQ, and empty finish times", () => {
    const mockCsv = `meet_name,division,team_name,athlete_full_name,gender,grade,finish_time_str,place_overall\nMock Meet,Varsity,Mock Team,Athlete One,F,12,DNF,1\nMock Meet,Varsity,Mock Team,Athlete Two,M,11,DQ,2\nMock Meet,Varsity,Mock Team,Athlete Three,M,11,,3\n`;

    const fsSpy = jest.spyOn(fs, "readFileSync").mockReturnValue(mockCsv);

    resetSeasonDataCache();
    const rows = getSeasonRows({ meet: "Mock Meet" });

    expect(fsSpy).toHaveBeenCalled();
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ status: "DNF", timeSeconds: null });
    expect(rows[1]).toMatchObject({ status: "DQ", timeSeconds: null });
    expect(rows[2]).toMatchObject({ status: "NO_RESULT", timeSeconds: null });
  });
});
