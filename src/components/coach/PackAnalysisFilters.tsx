"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface PackAnalysisFiltersProps {
  divisions: string[];
  teams: string[];
  genders: string[];
  grades: number[];
}

export function PackAnalysisFilters({
  divisions,
  teams,
  genders,
  grades,
}: PackAnalysisFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDivision = searchParams.get("division") || "";
  const currentGender = searchParams.get("gender") || "";
  const currentGrade = searchParams.get("grade") || "";
  const currentTeams = searchParams.get("teams") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Division</label>
            <Select
              value={currentDivision}
              onValueChange={(v) => updateParam("division", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Divisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Divisions</SelectItem>
                {divisions.map((div) => (
                  <SelectItem key={div} value={div}>
                    {div}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gender</label>
            <Select
              value={currentGender}
              onValueChange={(v) => updateParam("gender", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Genders</SelectItem>
                {genders.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Grade</label>
            <Select
              value={currentGrade}
              onValueChange={(v) => updateParam("grade", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={String(grade)}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Compare Teams</label>
            <Select
              value={currentTeams}
              onValueChange={(v) => updateParam("teams", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Auto (Top 2 Rivals)</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
