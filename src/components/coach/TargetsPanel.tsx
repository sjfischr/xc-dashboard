"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TeamColor } from "@/lib/config/teams";
import { cn } from "@/lib/utils";

export interface TargetOpponent {
  team: string;
  scoreDiff: number | null;
  avgTimeDiff: number | null;
  finisherCount: number;
  badges: string[];
  colors?: TeamColor;
}

export interface TargetSegmentData {
  id: string;
  division: string;
  gender: string;
  grade: number | null;
  meet: string;
  date: string;
  opponents: TargetOpponent[];
}

export interface TargetsPanelProps {
  ourTeam: string;
  segments: TargetSegmentData[];
  printHref: string;
  emptyStateMessage?: string;
}

const FALLBACK_COLORS: TeamColor = {
  primary: "#6b7280",
  secondary: "#d1d5db",
};

function formatScoreDiff(diff: number | null): string {
  if (diff === null) {
    return "Score —";
  }

  const sign = diff >= 0 ? "+" : "";
  return `Score ${sign}${diff}`;
}

function formatTimeDiff(diff: number | null): string {
  if (diff === null) {
    return "Avg —";
  }

  const sign = diff >= 0 ? "+" : "";
  return `Avg ${sign}${diff.toFixed(1)}s`;
}

function formatGrade(grade: number | null): string {
  if (grade === null) {
    return "All Grades";
  }

  return `Grade ${grade}`;
}

function formatGender(gender: string): string {
  if (!gender) {
    return "Mixed";
  }

  const normalized = gender.trim().toUpperCase();
  if (normalized.length === 1) {
    return normalized === "F"
      ? "Girls"
      : normalized === "M"
        ? "Boys"
        : normalized;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function formatDateLabel(date: string): string | null {
  if (!date) {
    return null;
  }

  const parsed = Date.parse(date);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(parsed));
}

const badgeVariantByType: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  TIE: "secondary",
  CLOSE: "outline",
  STRETCH: "destructive",
};

interface TeamChipProps {
  name: string;
  color?: TeamColor;
}

function TeamChip({ name, color }: TeamChipProps) {
  const palette = color ?? FALLBACK_COLORS;

  return (
    <span className="flex items-center gap-2">
      <span
        className="h-3 w-3 rounded-full"
        style={{
          backgroundColor: palette.primary,
          boxShadow: `0 0 0 2px ${palette.secondary}`,
        }}
        aria-hidden="true"
      />
      <span className="text-sm font-semibold leading-tight">{name}</span>
    </span>
  );
}

interface OpponentRowProps {
  opponent: TargetOpponent;
}

function OpponentRow({ opponent }: OpponentRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border/60 bg-muted/20 p-3 transition hover:border-border hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-1">
        <TeamChip name={opponent.team} color={opponent.colors} />
        <div className="text-xs text-muted-foreground">
          {formatScoreDiff(opponent.scoreDiff)} ·{" "}
          {formatTimeDiff(opponent.avgTimeDiff)} · Finishers{" "}
          {opponent.finisherCount}
        </div>
      </div>
      {opponent.badges.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {opponent.badges.map((badge) => (
            <Badge
              key={badge}
              variant={badgeVariantByType[badge] ?? "secondary"}
              className="uppercase"
            >
              {badge}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface SegmentBlockProps {
  segment: TargetSegmentData;
}

function SegmentBlock({ segment }: SegmentBlockProps) {
  const dateLabel = formatDateLabel(segment.date);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-background/60 p-4">
      <div className="flex flex-col gap-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {segment.division || "Open"} · {formatGender(segment.gender)} ·{" "}
          {formatGrade(segment.grade)}
        </div>
        <div className="text-lg font-semibold text-foreground">
          {segment.meet}
        </div>
        {dateLabel ? (
          <div className="text-xs text-muted-foreground">{dateLabel}</div>
        ) : null}
      </div>
      {segment.opponents.length > 0 ? (
        <div className="flex flex-col gap-3">
          {segment.opponents.map((opponent) => (
            <OpponentRow
              key={`${segment.id}-${opponent.team}`}
              opponent={opponent}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
          We finished ahead of everyone in this segment last time out.
        </div>
      )}
    </div>
  );
}

export function TargetsPanel({
  ourTeam,
  segments,
  printHref,
  emptyStateMessage,
}: TargetsPanelProps) {
  const description = ourTeam
    ? `Focusing on teams that finished ahead of ${ourTeam}.`
    : "Configure NEXT_PUBLIC_OUR_TEAM to see tailored targets.";

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>Teams to Target – Next Meet</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button asChild variant="outline">
          <Link href={printHref}>Print View</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {segments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            {emptyStateMessage ?? "No recent meet data found for this team."}
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-6",
              segments.length > 1 ? "md:grid-cols-2" : "grid-cols-1"
            )}
          >
            {segments.map((segment) => (
              <SegmentBlock key={segment.id} segment={segment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
