import {
  computePackGaps,
  computeTeamScore,
  nearestRivalsByAthlete,
  teamsThatBeatUs,
  trendByTeam,
} from "../engine";
import { canonicalTeam } from "../../config/teams";
import type { ResultRow } from "../../data/types";

const makeRow = (overrides: Partial<ResultRow>): ResultRow => ({
  meet: "Invite A",
  date: "2024-09-01",
  division: "Varsity",
  team: "XC Hawks",
  athlete: "Placeholder Runner",
  gender: "F",
  grade: 12,
  place: 1,
  rawTime: "6:00",
  timeSeconds: 360,
  status: "FINISHED",
  ...overrides,
});

const rows: ResultRow[] = [
  makeRow({
    athlete: "Alice Hart",
    team: "XC Hawks",
    place: 1,
    timeSeconds: 360,
    rawTime: "6:00",
  }),
  makeRow({
    athlete: "Brooke Lane",
    team: "XC Hawks",
    place: 5,
    timeSeconds: 370,
    rawTime: "6:10",
  }),
  makeRow({
    athlete: "Casey Reid",
    team: "XC Hawks",
    place: 9,
    timeSeconds: 380,
    rawTime: "6:20",
  }),
  makeRow({
    athlete: "Dani Shaw",
    team: "XC Hawks",
    place: 12,
    timeSeconds: 390,
    rawTime: "6:30",
  }),
  makeRow({
    athlete: "Ellie Tran",
    team: "XC Hawks",
    place: 15,
    timeSeconds: 400,
    rawTime: "6:40",
  }),
  makeRow({
    athlete: "Frankie Wu",
    team: "XC Hawks",
    place: 18,
    timeSeconds: 410,
    rawTime: "6:50",
  }),
  makeRow({
    athlete: "Greer Young",
    team: "XC Hawks",
    place: 21,
    timeSeconds: 420,
    rawTime: "7:00",
  }),
  makeRow({
    athlete: "Rita Zhang",
    team: "XC Hawks",
    place: null,
    status: "DNF",
    rawTime: "DNF",
    timeSeconds: null,
  }),
  makeRow({
    athlete: "Hayley Abbott",
    team: "Speedsters",
    place: 2,
    timeSeconds: 355,
    rawTime: "5:55",
  }),
  makeRow({
    athlete: "Imani Cole",
    team: "Speedsters",
    place: 4,
    timeSeconds: 365,
    rawTime: "6:05",
  }),
  makeRow({
    athlete: "Jessa Diaz",
    team: "Speedsters",
    place: 6,
    timeSeconds: 375,
    rawTime: "6:15",
  }),
  makeRow({
    athlete: "Kira Evans",
    team: "Speedsters",
    place: 8,
    timeSeconds: 385,
    rawTime: "6:25",
  }),
  makeRow({
    athlete: "Lena Fox",
    team: "Speedsters",
    place: 10,
    timeSeconds: 395,
    rawTime: "6:35",
  }),
  makeRow({
    athlete: "Mina Grey",
    team: "Joggers",
    place: 3,
    timeSeconds: 400,
    rawTime: "6:40",
  }),
  makeRow({
    athlete: "Nina Hale",
    team: "Joggers",
    place: 7,
    timeSeconds: 410,
    rawTime: "6:50",
  }),
  makeRow({
    athlete: "Opal Ives",
    team: "Joggers",
    place: 11,
    timeSeconds: 420,
    rawTime: "7:00",
  }),
  makeRow({
    athlete: "Pia Jones",
    team: "Joggers",
    place: 14,
    timeSeconds: 430,
    rawTime: "7:10",
  }),
  makeRow({
    athlete: "Quinn Kale",
    team: "Joggers",
    place: 19,
    timeSeconds: 440,
    rawTime: "7:20",
  }),
  makeRow({
    meet: "Invite B",
    date: "2024-09-15",
    team: "XC Hawks",
    athlete: "Alice Hart",
    place: 3,
    timeSeconds: 350,
    rawTime: "5:50",
  }),
  makeRow({
    meet: "Invite B",
    date: "2024-09-15",
    team: "XC Hawks",
    athlete: "Brooke Lane",
    place: 7,
    timeSeconds: 360,
    rawTime: "6:00",
  }),
  makeRow({
    meet: "Invite B",
    date: "2024-09-15",
    team: "XC Hawks",
    athlete: "Casey Reid",
    place: 11,
    timeSeconds: 370,
    rawTime: "6:10",
  }),
  makeRow({
    meet: "Invite B",
    date: "2024-09-15",
    team: "XC Hawks",
    athlete: "Dani Shaw",
    place: 15,
    timeSeconds: 380,
    rawTime: "6:20",
  }),
  makeRow({
    meet: "Invite B",
    date: "2024-09-15",
    team: "XC Hawks",
    athlete: "Ellie Tran",
    place: 19,
    timeSeconds: 390,
    rawTime: "6:30",
  }),
  makeRow({
    meet: "Invite B",
    date: "2024-09-15",
    team: "Speedsters",
    athlete: "Hayley Abbott",
    place: 1,
    timeSeconds: 345,
    rawTime: "5:45",
  }),
  makeRow({
    meet: "Invite B",
    date: "2024-09-15",
    team: "Speedsters",
    athlete: "Imani Cole",
    place: 5,
    timeSeconds: 355,
    rawTime: "5:55",
  }),
  makeRow({
    meet: "Invite B",
    date: "2024-09-15",
    team: "Speedsters",
    athlete: "Jessa Diaz",
    place: 9,
    timeSeconds: 365,
    rawTime: "6:05",
  }),
  makeRow({
    meet: "Invite B",
    date: "2024-09-15",
    team: "Speedsters",
    athlete: "Kira Evans",
    place: 13,
    timeSeconds: 375,
    rawTime: "6:15",
  }),
  makeRow({
    meet: "Invite B",
    date: "2024-09-15",
    team: "Speedsters",
    athlete: "Lena Fox",
    place: 17,
    timeSeconds: 385,
    rawTime: "6:25",
  }),
  makeRow({
    meet: "Invite C",
    date: "2024-10-01",
    team: "XC Hawks",
    athlete: "Alice Hart",
    place: 5,
    timeSeconds: 365,
    rawTime: "6:05",
  }),
  makeRow({
    meet: "Invite C",
    date: "2024-10-01",
    team: "XC Hawks",
    athlete: "Brooke Lane",
    place: 9,
    timeSeconds: 375,
    rawTime: "6:15",
  }),
  makeRow({
    meet: "Invite C",
    date: "2024-10-01",
    team: "XC Hawks",
    athlete: "Casey Reid",
    place: 13,
    timeSeconds: 385,
    rawTime: "6:25",
  }),
  makeRow({
    meet: "Invite C",
    date: "2024-10-01",
    team: "XC Hawks",
    athlete: "Dani Shaw",
    place: 17,
    timeSeconds: 395,
    rawTime: "6:35",
  }),
];

describe("computeTeamScore", () => {
  it("calculates scoring placements and tie-breakers for a full squad", () => {
    const result = computeTeamScore(rows, "invite a", "xc hawks");

    expect(result.score).toBe(42);
    expect(result.finisherCount).toBe(7);
    expect(result.team).toBe("XC Hawks");
    expect(result.placements.map((entry) => entry.athlete)).toEqual([
      "Alice Hart",
      "Brooke Lane",
      "Casey Reid",
      "Dani Shaw",
      "Ellie Tran",
    ]);
    expect(result.tieBreakers.sixth?.athlete).toBe("Frankie Wu");
    expect(result.tieBreakers.seventh?.athlete).toBe("Greer Young");
  });

  it("resolves alias input to a canonical team", () => {
    const result = computeTeamScore(rows, "Invite A", "Hawks");

    expect(result.team).toBe("XC Hawks");
    expect(result.score).toBe(42);
  });

  it("honors a custom scoring depth", () => {
    const result = computeTeamScore(rows, "Invite A", "Speedsters", {
      topN: 4,
    });

    expect(result.score).toBe(20);
    expect(result.placements).toHaveLength(4);
  });

  it("returns null score when not enough finishers", () => {
    const result = computeTeamScore(rows, "Invite C", "XC Hawks");

    expect(result.score).toBeNull();
    expect(result.placements).toHaveLength(4);
  });
});

describe("computePackGaps", () => {
  it("calculates pack gaps and dispersion metrics", () => {
    const result = computePackGaps(rows, "Invite A", "XC Hawks");

    expect(result.gap1To5Seconds).toBeCloseTo(40, 5);
    expect(result.gap1To7Seconds).toBeCloseTo(60, 5);
    expect(result.top5StdDevSeconds).toBeCloseTo(14.142, 3);
  });

  it("returns null gaps when fewer than five finishers", () => {
    const result = computePackGaps(rows, "Invite C", "XC Hawks");

    expect(result.gap1To5Seconds).toBeNull();
    expect(result.gap1To7Seconds).toBeNull();
    expect(result.top5StdDevSeconds).toBeNull();
  });
});

describe("nearestRivalsByAthlete", () => {
  it("finds opponents within a given time window", () => {
    const result = nearestRivalsByAthlete(rows, "Invite A", "Alice Hart", {
      windowSec: 10,
    });

    expect(result.team).toBe("XC Hawks");
    expect(result.rivals.map((entry) => entry.athlete)).toEqual([
      "Hayley Abbott",
      "Imani Cole",
    ]);
    expect(result.rivals.map((entry) => entry.deltaSeconds)).toEqual([-5, 5]);
  });

  it("returns an empty set when the athlete is absent", () => {
    const result = nearestRivalsByAthlete(rows, "Invite A", "Unknown Athlete");

    expect(result.team).toBe("");
    expect(result.timeSeconds).toBeNull();
    expect(result.rivals).toHaveLength(0);
  });
});

describe("teamsThatBeatUs", () => {
  it("lists opponents that finished ahead with score and time deltas", () => {
    const result = teamsThatBeatUs(rows, "Invite A", "hawks");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      opponent: "Speedsters",
      scoreDifference: 12,
    });
    expect(result[0].averageTimeGapSeconds).toBeCloseTo(5, 5);
  });

  it("returns empty when our team does not score", () => {
    const result = teamsThatBeatUs(rows, "Invite C", "XC Hawks");

    expect(result).toHaveLength(0);
  });
});

describe("trendByTeam", () => {
  it("aggregates meet-over-meet trends", () => {
    const result = trendByTeam(rows, "xc hawks varsity");

    expect(result.map((point) => point.meet)).toEqual([
      "Invite A",
      "Invite B",
      "Invite C",
    ]);
    expect(result[0]).toMatchObject({
      score: 42,
      averageTop5TimeSeconds: 380,
      packGapSeconds: 40,
    });
    expect(result[2]).toMatchObject({
      score: null,
      averageTop5TimeSeconds: null,
      packGapSeconds: null,
    });
  });
});

describe("canonicalTeam", () => {
  it("normalizes aliases to configured canonical names", () => {
    expect(canonicalTeam(" Hawks ")).toBe("XC Hawks");
    expect(canonicalTeam("Speedsters XC")).toBe("Speedsters");
    expect(canonicalTeam("Unknown Club")).toBe("Unknown Club");
    expect(canonicalTeam(" ")).toBe("");
  });
});
