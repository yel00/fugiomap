"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";

const STATUS_LABEL: Record<string, string> = {
  setup: "Setup",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

const STATUS_COLOR: Record<string, string> = {
  setup: "secondary",
  active: "default",
  completed: "outline",
  archived: "secondary",
};

export default function DashboardPage() {
  const { user } = useUser();
  const surveys = useQuery(api.surveys.listByUser, {
    clerkUserId: user?.id ?? "",
  });

  const seedQuestions = useMutation(api.questions.seed);

  useEffect(() => {
    seedQuestions();
  }, [seedQuestions]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-slate-900 rounded" />
            <span className="font-semibold text-slate-900">Fugio MAP</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
            </span>
            <Link href="/sign-out">
              <Button variant="ghost" size="sm">Sign out</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your assessments</h1>
            <p className="text-slate-500 mt-1">
              Create and manage your organizational diagnostics
            </p>
          </div>
          <Link href="/surveys/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New assessment
            </Button>
          </Link>
        </div>

        {surveys === undefined ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-28 bg-slate-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : surveys.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="w-10 h-10 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No assessments yet
              </h3>
              <p className="text-slate-500 mb-6 max-w-xs">
                Create your first diagnostic to find out what's holding your
                product back.
              </p>
              <Link href="/surveys/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <SurveyCard key={survey._id} survey={survey} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SurveyCard({ survey }: { survey: any }) {
  const progress = useQuery(api.analysis.getSurveyProgress, {
    surveyId: survey._id,
  });

  const destination =
    survey.status === "setup"
      ? `/surveys/${survey._id}/setup`
      : survey.status === "active"
      ? `/surveys/${survey._id}/status`
      : `/surveys/${survey._id}/report`;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-slate-900 text-lg">
                {survey.name}
              </h3>
              <Badge variant={STATUS_COLOR[survey.status] as any}>
                {STATUS_LABEL[survey.status]}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm">
              {survey.companyName} · {survey.industry} · {survey.location}
            </p>
            {progress && (
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {progress.total} participants
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  {progress.completed} completed
                </span>
                {progress.started > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-yellow-500" />
                    {progress.started} in progress
                  </span>
                )}
              </div>
            )}
          </div>
          <Link href={destination}>
            <Button variant="ghost" size="sm" className="gap-1">
              {survey.status === "setup"
                ? "Continue setup"
                : survey.status === "active"
                ? "View status"
                : "View report"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
        {progress && progress.total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Completion</span>
              <span>{progress.completionPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all"
                style={{ width: `${progress.completionPct}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
