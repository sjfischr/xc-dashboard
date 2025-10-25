"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ReportsPage() {
  // Sample data for charts
  const performanceData = [
    { month: "Jan", avgTime: 18.5, races: 2 },
    { month: "Feb", avgTime: 18.3, races: 1 },
    { month: "Mar", avgTime: 18.1, races: 3 },
    { month: "Apr", avgTime: 17.9, races: 2 },
    { month: "May", avgTime: 17.8, races: 1 },
    { month: "Jun", avgTime: 17.6, races: 2 },
  ];

  const teamDistribution = [
    { grade: "Freshmen", count: 6, color: "#0088FE" },
    { grade: "Sophomores", count: 5, color: "#00C49F" },
    { grade: "Juniors", count: 7, color: "#FFBB28" },
    { grade: "Seniors", count: 6, color: "#FF8042" },
  ];

  const weeklyMileage = [
    { week: "Week 1", mileage: 45 },
    { week: "Week 2", mileage: 48 },
    { week: "Week 3", mileage: 52 },
    { week: "Week 4", mileage: 35 }, // Deload week
    { week: "Week 5", mileage: 55 },
    { week: "Week 6", mileage: 58 },
  ];

  const raceResults = [
    {
      race: "City Invitational",
      date: "2025-09-15",
      participants: 18,
      avgTime: "18:24",
      bestTime: "16:45",
    },
    {
      race: "County Championships",
      date: "2025-09-28",
      participants: 20,
      avgTime: "18:12",
      bestTime: "16:52",
    },
    {
      race: "Regional Qualifier",
      date: "2025-10-10",
      participants: 16,
      avgTime: "18:35",
      bestTime: "17:03",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-muted-foreground text-lg">
              Team performance insights and race analytics
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">← Back to Dashboard</Link>
          </Button>
        </div>

        <div className="mb-6">
          <Select defaultValue="season">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="season">2025 Season</SelectItem>
              <SelectItem value="last-season">2024 Season</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="team">Team Stats</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="races">Race Results</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Average 5K Times Over Season</CardTitle>
                <CardDescription>
                  Team performance progression throughout the year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      domain={[17, 19]}
                      label={{
                        value: "Time (minutes)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} min`, "Avg 5K Time"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgTime"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Composition by Grade</CardTitle>
                  <CardDescription>
                    Distribution of athletes across grade levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={teamDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ grade, count }) => `${grade}: ${count}`}
                      >
                        {teamDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Statistics</CardTitle>
                  <CardDescription>
                    Key metrics for the current season
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Athletes</span>
                    <Badge variant="secondary">24</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average 5K Time</span>
                    <Badge>18:24</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Fastest 5K</span>
                    <Badge variant="destructive">16:45</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Races This Season
                    </span>
                    <Badge variant="outline">8</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Weekly Avg Mileage
                    </span>
                    <Badge variant="secondary">52 miles</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Team Mileage</CardTitle>
                <CardDescription>
                  Average weekly training volume over recent weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyMileage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis
                      label={{
                        value: "Miles",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} miles`, "Team Avg"]}
                    />
                    <Bar dataKey="mileage" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="races" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Race Results</CardTitle>
                <CardDescription>
                  Performance summary from this season&apos;s competitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {raceResults.map((race, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{race.race}</h3>
                        <Badge variant="outline">{race.date}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Participants:{" "}
                          </span>
                          <span className="font-medium">
                            {race.participants}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Team Avg:{" "}
                          </span>
                          <span className="font-medium">{race.avgTime}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Best Time:{" "}
                          </span>
                          <span className="font-medium">{race.bestTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
