"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
  BarChart3,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const STATUS_ICON: Record<string, React.ReactNode> = {
  invited: <Mail className="w-4 h-4 text-slate-400" />,
  started: <Clock className="w-4 h-4 text-yellow-500" />,
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
};

export default function StatusPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as Id<"surveys">;

  const survey = useQuery(api.surveys.get, { id: surveyId });
  const participants = useQuery(api.participants.listBySurvey, { surveyId });
  const progress = useQuery(api.analysis.getSurveyProgress, { surveyId });

  const generateReport = useMutation(api.analysis.generateReport);
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      await generateReport({ surveyId });
      router.push(`/surveys/${surveyId}/report`);
    } catch {
      toast.error("Failed to generate report");
      setGenerating(false);
    }
  };

  const handleSendReminder = async (participantId: Id<"participants">, email: string) => {
    const participant = participants?.find(p => p._id === participantId);
    if (!participant) return;

    try {
      await fetch("/api/email/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: participant.name,
          token: participant.token,
          surveyName: survey?.name,
          participantId,
        }),
      });
      toast.success(`Reminder sent to ${email}`);
    } catch {
      toast.error("Failed to send reminder");
    }
  };

  if (!survey || !participants || !progress) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const canGenerate = progress.completed >= 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <span className="text-slate-300">·</span>
          <span className="text-sm text-slate-900 font-medium">{survey.name}</span>
          <Badge className="ml-auto">Active</Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Progress summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-slate-900">{progress.total}</div>
              <div className="text-sm text-slate-500 mt-1">Total invited</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-green-600">{progress.completed}</div>
              <div className="text-sm text-slate-500 mt-1">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-slate-900">
                {progress.completionPct}%
              </div>
              <div className="text-sm text-slate-500 mt-1">Completion rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all"
              style={{ width: `${progress.completionPct}%` }}
            />
          </div>
        </div>

        {/* Generate report CTA */}
        {canGenerate && (
          <Card className="mb-8 border-slate-900">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {progress.completionPct === 100
                    ? "All responses are in!"
                    : `${progress.completed} of ${progress.total} responses collected`}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  You can generate the report now or wait for more responses.
                </p>
              </div>
              <Button
                onClick={handleGenerateReport}
                disabled={generating}
                className="gap-2 flex-shrink-0"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
                Generate report
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Participant list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {participants.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {STATUS_ICON[p.status]}
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.role} · {p.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        p.status === "completed"
                          ? "default"
                          : p.status === "started"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {p.status}
                    </Badge>
                    {p.status !== "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs h-7"
                        onClick={() => handleSendReminder(p._id, p.email)}
                      >
                        <RefreshCw className="w-3 h-3" />
                        Remind
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Survey link for sharing */}
        <Card className="mt-6">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-900 mb-2">Survey base URL</p>
            <p className="text-xs text-slate-500 mb-3">
              Each participant received a unique link. Share the base format with anyone you need to add manually.
            </p>
            <code className="text-xs bg-slate-100 px-3 py-2 rounded block">
              {process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/take/[participant-token]
            </code>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
