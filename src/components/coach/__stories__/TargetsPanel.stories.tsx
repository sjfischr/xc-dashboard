"use client";

import type { ComponentProps } from "react";

import { TargetsPanel } from "../TargetsPanel";

const meta = {
  title: "Coach/Targets Panel",
  component: TargetsPanel,
};

export default meta;

type StoryProps = ComponentProps<typeof TargetsPanel>;

const sampleSegments: StoryProps["segments"] = [
  {
    id: "varsity-f-12",
    division: "Varsity",
    gender: "F",
    grade: 12,
    meet: "Conference Championship",
    date: "2024-10-12",
    opponents: [
      {
        team: "St Agnes",
        scoreDiff: 8,
        avgTimeDiff: 6.4,
        finisherCount: 7,
        badges: ["CLOSE"],
        colors: { primary: "#eab308", secondary: "#facc15" },
      },
      {
        team: "St Ambrose",
        scoreDiff: 0,
        avgTimeDiff: 12.1,
        finisherCount: 7,
        badges: ["TIE"],
        colors: { primary: "#dc2626", secondary: "#f87171" },
      },
      {
        team: "St Michael",
        scoreDiff: 18,
        avgTimeDiff: 48.5,
        finisherCount: 7,
        badges: ["STRETCH"],
        colors: { primary: "#17823b", secondary: "#86efac" },
      },
    ],
  },
  {
    id: "junior-m-10",
    division: "Junior Varsity",
    gender: "M",
    grade: 10,
    meet: "Falcon Invite",
    date: "2024-09-28",
    opponents: [],
  },
];

export const Default = (args: StoryProps) => (
  <TargetsPanel
    {...args}
    ourTeam={args.ourTeam ?? "XC Hawks"}
    segments={args.segments ?? sampleSegments}
    printHref={args.printHref ?? "/coach/targets/print"}
    emptyStateMessage={args.emptyStateMessage}
  />
);

Default.args = {
  ourTeam: "XC Hawks",
  segments: sampleSegments,
  printHref: "/coach/targets/print",
};
