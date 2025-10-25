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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AthletePage() {
  const recentWorkouts = [
    {
      date: "2025-10-24",
      type: "Easy Run",
      distance: "5 miles",
      time: "37:30",
      pace: "7:30/mile",
    },
    {
      date: "2025-10-22",
      type: "Tempo Run",
      distance: "4 miles",
      time: "25:20",
      pace: "6:20/mile",
    },
    {
      date: "2025-10-20",
      type: "Long Run",
      distance: "8 miles",
      time: "58:40",
      pace: "7:20/mile",
    },
    {
      date: "2025-10-18",
      type: "Intervals",
      distance: "5x800m",
      time: "14:35",
      pace: "5:50/800m",
    },
  ];

  const upcomingWorkouts = [
    {
      date: "2025-10-26",
      type: "Recovery Run",
      distance: "3 miles",
      targetPace: "8:00/mile",
    },
    {
      date: "2025-10-28",
      type: "Threshold Run",
      distance: "3 miles",
      targetPace: "6:15/mile",
    },
    {
      date: "2025-10-30",
      type: "Long Run",
      distance: "10 miles",
      targetPace: "7:15/mile",
    },
  ];

  const personalRecords = [
    {
      event: "5K",
      time: "18:24",
      date: "2025-09-15",
      location: "City Invitational",
    },
    {
      event: "10K",
      time: "39:45",
      date: "2025-08-20",
      location: "Summer Classic",
    },
    { event: "Mile", time: "5:32", date: "2025-07-10", location: "Track Meet" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Athlete Portal</h1>
            <p className="text-muted-foreground text-lg">
              Welcome back, Sarah! Track your progress and view your training
              plan.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">← Back to Dashboard</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32 miles</div>
              <p className="text-sm text-muted-foreground">Total distance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Current 5K PR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18:24</div>
              <p className="text-sm text-muted-foreground">Personal best</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Next Race</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 days</div>
              <p className="text-sm text-muted-foreground">
                Regional Championships
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="training" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="training">Training Log</TabsTrigger>
            <TabsTrigger value="schedule">Upcoming Workouts</TabsTrigger>
            <TabsTrigger value="records">Personal Records</TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Workouts</CardTitle>
                <CardDescription>
                  Your training log for the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Workout Type</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Avg Pace</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentWorkouts.map((workout, index) => (
                      <TableRow key={index}>
                        <TableCell>{workout.date}</TableCell>
                        <TableCell className="font-medium">
                          {workout.type}
                        </TableCell>
                        <TableCell>{workout.distance}</TableCell>
                        <TableCell>{workout.time}</TableCell>
                        <TableCell>{workout.pace}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Training</CardTitle>
                <CardDescription>
                  Your scheduled workouts for the next week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Workout Type</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Target Pace</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingWorkouts.map((workout, index) => (
                      <TableRow key={index}>
                        <TableCell>{workout.date}</TableCell>
                        <TableCell className="font-medium">
                          {workout.type}
                        </TableCell>
                        <TableCell>{workout.distance}</TableCell>
                        <TableCell>{workout.targetPace}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Scheduled</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Records</CardTitle>
                <CardDescription>
                  Your best times across different distances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personalRecords.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {record.event}
                        </TableCell>
                        <TableCell className="font-mono text-lg">
                          {record.time}
                        </TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
