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

export default function CoachPage() {
  const athletes = [
    {
      id: 1,
      name: "Sarah Johnson",
      grade: "Senior",
      pr5k: "18:24",
      status: "Active",
    },
    {
      id: 2,
      name: "Mike Chen",
      grade: "Junior",
      pr5k: "16:45",
      status: "Active",
    },
    {
      id: 3,
      name: "Emma Davis",
      grade: "Sophomore",
      pr5k: "19:12",
      status: "Injured",
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      grade: "Senior",
      pr5k: "17:03",
      status: "Active",
    },
  ];

  const upcomingWorkouts = [
    {
      date: "2025-10-26",
      type: "Tempo Run",
      distance: "4 miles",
      pace: "6:20/mile",
    },
    {
      date: "2025-10-27",
      type: "Easy Run",
      distance: "6 miles",
      pace: "7:00/mile",
    },
    {
      date: "2025-10-28",
      type: "Interval Training",
      distance: "5x800m",
      pace: "5:50/800m",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Coach Portal</h1>
            <p className="text-muted-foreground text-lg">
              Manage your team and training programs
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">← Back to Dashboard</Link>
          </Button>
        </div>

        <Tabs defaultValue="athletes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="athletes">Athletes</TabsTrigger>
            <TabsTrigger value="training">Training Plans</TabsTrigger>
            <TabsTrigger value="races">Race Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="athletes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Roster</CardTitle>
                <CardDescription>
                  Manage your athletes and track their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>5K PR</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {athletes.map((athlete) => (
                      <TableRow key={athlete.id}>
                        <TableCell className="font-medium">
                          {athlete.name}
                        </TableCell>
                        <TableCell>{athlete.grade}</TableCell>
                        <TableCell>{athlete.pr5k}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              athlete.status === "Active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {athlete.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Workouts</CardTitle>
                <CardDescription>
                  This week&apos;s training schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Workout Type</TableHead>
                      <TableHead>Distance/Reps</TableHead>
                      <TableHead>Target Pace</TableHead>
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
                        <TableCell>{workout.pace}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="races" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Race Calendar</CardTitle>
                <CardDescription>
                  Upcoming meets and competitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">Regional Championships</h3>
                      <Badge>November 15, 2025</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      5K Course - Central Park, State University
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">State Championships</h3>
                      <Badge variant="secondary">November 29, 2025</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      5K Course - State Park Athletic Complex
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
