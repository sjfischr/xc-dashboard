import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">XC Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Cross Country Performance Management System
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Coach Portal
                <Badge variant="secondary">Admin</Badge>
              </CardTitle>
              <CardDescription>
                Manage team roster, training plans, and athlete performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/coach">Access Coach Portal</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Athlete Portal
                <Badge variant="outline">Training</Badge>
              </CardTitle>
              <CardDescription>
                View your training schedule, log workouts, and track progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/athlete">Access Athlete Portal</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Reports & Analytics
                <Badge variant="destructive">Insights</Badge>
              </CardTitle>
              <CardDescription>
                Performance analytics, race results, and team statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">
                  Active Athletes
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">
                  This Week&apos;s Workouts
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">15:24</div>
                <div className="text-sm text-muted-foreground">Avg 5K Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">
                  Upcoming Races
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
