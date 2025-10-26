"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";
import { computeTeamScore } from "@/lib/analytics/engine";
import type { ResultRow } from "@/lib/data/types";

interface SimulatorContentProps {
  rows: ResultRow[];
  meets: string[];
  teams: string[];
  ourTeam: string;
}

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

export function SimulatorContent({
  rows,
  meets,
  teams,
  ourTeam,
}: SimulatorContentProps) {
  const [selectedMeet, setSelectedMeet] = useState<string>(meets[0] || "");
  const [adjustments, setAdjustments] = useState<Map<string, number>>(
    new Map()
  );

  // Filter rows for selected meet and our team
  const ourAthletes = useMemo(() => {
    if (!selectedMeet) return [];

    return rows
      .filter(
        (row) =>
          normalizeKey(row.meet) === normalizeKey(selectedMeet) &&
          normalizeKey(row.team) === normalizeKey(ourTeam) &&
          row.status === "FINISHED" &&
          typeof row.timeSeconds === "number" &&
          Number.isFinite(row.timeSeconds)
      )
      .sort((a, b) => {
        const timeA = a.timeSeconds ?? Number.POSITIVE_INFINITY;
        const timeB = b.timeSeconds ?? Number.POSITIVE_INFINITY;
        return timeA - timeB;
      });
  }, [rows, selectedMeet, ourTeam]);

  // Create modified rows with adjustments
  const modifiedRows = useMemo(() => {
    return rows.map((row) => {
      const adjustment = adjustments.get(row.athlete);
      if (
        adjustment !== undefined &&
        normalizeKey(row.meet) === normalizeKey(selectedMeet) &&
        normalizeKey(row.team) === normalizeKey(ourTeam) &&
        typeof row.timeSeconds === "number"
      ) {
        return {
          ...row,
          timeSeconds: row.timeSeconds + adjustment,
        };
      }
      return row;
    });
  }, [rows, adjustments, selectedMeet, ourTeam]);

  // Get meet rows for calculations
  const meetRows = useMemo(() => {
    if (!selectedMeet) return [];
    return modifiedRows.filter(
      (row) => normalizeKey(row.meet) === normalizeKey(selectedMeet)
    );
  }, [modifiedRows, selectedMeet]);

  // Compute original and modified scores
  const originalScore = useMemo(() => {
    if (!selectedMeet) return null;
    return computeTeamScore(
      rows.filter(
        (row) => normalizeKey(row.meet) === normalizeKey(selectedMeet)
      ),
      selectedMeet,
      ourTeam
    );
  }, [rows, selectedMeet, ourTeam]);

  const modifiedScore = useMemo(() => {
    if (!selectedMeet) return null;
    return computeTeamScore(meetRows, selectedMeet, ourTeam);
  }, [meetRows, selectedMeet, ourTeam]);

  // Get all team scores for head-to-head comparison
  const allTeamScores = useMemo(() => {
    if (!selectedMeet) return [];

    const scores = teams
      .map((team) => {
        const original = computeTeamScore(
          rows.filter(
            (row) => normalizeKey(row.meet) === normalizeKey(selectedMeet)
          ),
          selectedMeet,
          team
        );
        const modified = computeTeamScore(meetRows, selectedMeet, team);
        return { team, original, modified };
      })
      .filter((s) => s.original.score !== null)
      .sort((a, b) => {
        const aScore = a.modified.score ?? Number.POSITIVE_INFINITY;
        const bScore = b.modified.score ?? Number.POSITIVE_INFINITY;
        return aScore - bScore;
      });

    return scores;
  }, [teams, rows, meetRows, selectedMeet]);

  const topRivals = useMemo(() => {
    return allTeamScores
      .filter((s) => normalizeKey(s.team) !== normalizeKey(ourTeam))
      .slice(0, 2);
  }, [allTeamScores, ourTeam]);

  const handleAdjustment = (athlete: string, delta: number) => {
    setAdjustments((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(athlete) || 0;
      const newValue = Math.max(-20, Math.min(20, current + delta));
      if (newValue === 0) {
        newMap.delete(athlete);
      } else {
        newMap.set(athlete, newValue);
      }
      return newMap;
    });
  };

  const handleReset = () => {
    setAdjustments(new Map());
  };

  const scoreDelta =
    originalScore?.score !== null && modifiedScore?.score !== null
      ? (originalScore?.score ?? 0) - (modifiedScore?.score ?? 0)
      : null;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Meet</label>
              <Select value={selectedMeet} onValueChange={setSelectedMeet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meet" />
                </SelectTrigger>
                <SelectContent>
                  {meets.map((meet) => (
                    <SelectItem key={meet} value={meet}>
                      {meet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Team</label>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                {ourTeam}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Athletes Table */}
      {ourAthletes.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Athlete Time Adjustments</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={adjustments.size === 0}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Athlete</TableHead>
                  <TableHead>Original Time</TableHead>
                  <TableHead>Adjustment</TableHead>
                  <TableHead>Modified Time</TableHead>
                  <TableHead>Controls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ourAthletes.slice(0, 7).map((athlete) => {
                  const adjustment = adjustments.get(athlete.athlete) || 0;
                  const modifiedTime = (athlete.timeSeconds ?? 0) + adjustment;

                  return (
                    <TableRow key={athlete.athlete}>
                      <TableCell className="font-medium">
                        {athlete.athlete}
                      </TableCell>
                      <TableCell>{formatTime(athlete.timeSeconds)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            adjustment < 0
                              ? "text-emerald-600"
                              : adjustment > 0
                                ? "text-rose-600"
                                : "text-muted-foreground"
                          }
                        >
                          {adjustment > 0 ? "+" : ""}
                          {adjustment.toFixed(1)}s
                        </span>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatTime(modifiedTime)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleAdjustment(athlete.athlete, -5)
                            }
                            disabled={adjustment <= -20}
                          >
                            -5s
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleAdjustment(athlete.athlete, -1)
                            }
                            disabled={adjustment <= -20}
                          >
                            -1s
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjustment(athlete.athlete, 1)}
                            disabled={adjustment >= 20}
                          >
                            +1s
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjustment(athlete.athlete, 5)}
                            disabled={adjustment >= 20}
                          >
                            +5s
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No athletes found for the selected meet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Score Impact */}
      {originalScore && modifiedScore && (
        <Card>
          <CardHeader>
            <CardTitle>Score Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Original Score</p>
                <p className="text-3xl font-bold">
                  {originalScore.score ?? "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Modified Score</p>
                <p className="text-3xl font-bold">
                  {modifiedScore.score ?? "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Delta</p>
                <p
                  className={`text-3xl font-bold ${
                    scoreDelta !== null
                      ? scoreDelta < 0
                        ? "text-emerald-600"
                        : scoreDelta > 0
                          ? "text-rose-600"
                          : ""
                      : ""
                  }`}
                >
                  {scoreDelta !== null ? (
                    <>
                      {scoreDelta > 0 ? "+" : ""}
                      {scoreDelta}
                      {scoreDelta < 0 ? (
                        <ArrowDown className="ml-2 inline h-6 w-6" />
                      ) : scoreDelta > 0 ? (
                        <ArrowUp className="ml-2 inline h-6 w-6" />
                      ) : null}
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>

            {topRivals.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">
                  Head-to-Head vs Top Rivals
                </h3>
                <div className="space-y-2">
                  {topRivals.map((rival) => {
                    const ourModScore = modifiedScore.score ?? 0;
                    const rivalScore = rival.modified.score ?? 0;
                    const originalOutcome =
                      (originalScore.score ?? 0) < (rival.original.score ?? 0)
                        ? "win"
                        : (originalScore.score ?? 0) >
                            (rival.original.score ?? 0)
                          ? "loss"
                          : "tie";
                    const modifiedOutcome =
                      ourModScore < rivalScore
                        ? "win"
                        : ourModScore > rivalScore
                          ? "loss"
                          : "tie";
                    const outcomeChanged = originalOutcome !== modifiedOutcome;

                    return (
                      <div
                        key={rival.team}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{rival.team}</span>
                          <Badge variant="secondary">Score: {rivalScore}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              modifiedOutcome === "win"
                                ? "default"
                                : modifiedOutcome === "loss"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {modifiedOutcome.toUpperCase()}
                          </Badge>
                          {outcomeChanged && (
                            <Badge variant="outline" className="text-xs">
                              Changed from {originalOutcome.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {allTeamScores.length > 2 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Full Standings</h3>
                <div className="space-y-1">
                  {allTeamScores.map((teamScore, index) => {
                    const isOurTeam =
                      normalizeKey(teamScore.team) === normalizeKey(ourTeam);
                    return (
                      <div
                        key={teamScore.team}
                        className={`flex items-center justify-between rounded px-3 py-2 text-sm ${
                          isOurTeam ? "bg-primary/10 font-semibold" : ""
                        }`}
                      >
                        <span>
                          {index + 1}. {teamScore.team}
                        </span>
                        <span className="font-mono">
                          {teamScore.modified.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
