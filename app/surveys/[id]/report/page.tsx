"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { useState } from "react";
import { toast } from "sonner";

const RISK_COLOR: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

const RISK_LABEL: Record<string, string> = {
  low: "Healthy",
  medium: "Caution",
  high: "At risk",
};

const RISK_ICON: Record<string, React.ReactNode> = {
  low: <CheckCircle className="w-4 h-4 text-green-500" />,
  medium: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  high: <AlertCircle className="w-4 h-4 text-red-500" />,
};

export default function ReportPage() {
  const params = useParams();
  const surveyId = params.id as Id<"surveys">;

  const survey = useQuery(api.surveys.get, { id: surveyId });
  const report = useQuery(api.analysis.getReport, { surveyId });
  const generateReport = useMutation(api.analysis.generateReport);

  const [filter, setFilter] = useState<string>("all");
  const [regenerating, setRegenerating] = useState(false);

  if (!survey || report === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No report generated yet.</p>
          <Link href={`/surveys/${surveyId}/status`}>
            <Button>Go to status page</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await generateReport({ surveyId });
      toast.success("Report regenerated");
    } catch {
      toast.error("Failed to regenerate report");
    }
    setRegenerating(false);
  };

  const handleExport = () => {
    toast.info("Export coming soon — will generate a watermarked PDF");
  };

  // Radar chart data
  const radarData = report.categoryScores.map((cs) => ({
    category: cs.category.replace(" & ", " &\n"),
    score: cs.avgScore,
    fullMark: 5,
  }));

  // Bar chart data, filtered
  const filteredQuestions =
    filter === "all"
      ? report.questionScores
      : report.questionScores.filter((q) => q.category === filter);

  const sortedQuestions = [...filteredQuestions].sort(
    (a, b) => a.avgScore - b.avgScore
  );

  const categories = [
    ...new Set(report.questionScores.map((q) => q.category)),
  ];

  const overallRisk =
    report.overallScore >= 3.5
      ? "low"
      : report.overallScore >= 2.5
      ? "medium"
      : "high";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <span className="text-slate-300">·</span>
          <span className="text-sm text-slate-900 font-medium">{survey.name}</span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="gap-1.5"
            >
              {regenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Refresh
            </Button>
            <Button size="sm" onClick={handleExport} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Summary row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="col-span-1">
            <CardContent className="p-5 text-center">
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: RISK_COLOR[overallRisk] }}
              >
                {report.overallScore.toFixed(1)}
              </div>
              <div className="text-sm text-slate-500">Overall score</div>
              <div className="text-xs text-slate-400">out of 5.0</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {report.participantCount}
              </div>
              <div className="text-sm text-slate-500">Participants</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {Math.round(report.completionRate * 100)}%
              </div>
              <div className="text-sm text-slate-500">Completion rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {report.categoryScores.filter((c) => c.riskLevel === "high").length}
              </div>
              <div className="text-sm text-slate-500">Risk areas</div>
              <div className="text-xs text-slate-400">need attention</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Radar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Domain overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 5]}
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#0f172a"
                    fill="#0f172a"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Risk by domain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...report.categoryScores]
                  .sort((a, b) => a.avgScore - b.avgScore)
                  .map((cs) => (
                    <div key={cs.category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {RISK_ICON[cs.riskLevel]}
                          <span className="text-sm text-slate-700 truncate max-w-48">
                            {cs.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              color: RISK_COLOR[cs.riskLevel],
                              background: RISK_COLOR[cs.riskLevel] + "18",
                            }}
                          >
                            {RISK_LABEL[cs.riskLevel]}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 w-8 text-right">
                            {cs.avgScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(cs.avgScore / 5) * 100}%`,
                            background: RISK_COLOR[cs.riskLevel],
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question-level detail */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Question-level scores</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filter === "all"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      filter === cat
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {cat.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={sortedQuestions.length * 40 + 60}>
              <BarChart
                data={sortedQuestions.map((q) => ({
                  text:
                    q.text.length > 60
                      ? q.text.substring(0, 57) + "..."
                      : q.text,
                  score: q.avgScore,
                  category: q.category,
                  risk:
                    q.avgScore >= 3.5
                      ? "low"
                      : q.avgScore >= 2.5
                      ? "medium"
                      : "high",
                }))}
                layout="vertical"
                margin={{ left: 200, right: 60, top: 10, bottom: 10 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="text"
                  width={195}
                  tick={{ fontSize: 11, fill: "#475569" }}
                />
                <Tooltip
                  formatter={(value: any) => [Number(value).toFixed(2), "Score"]}
                  labelStyle={{ fontSize: 12 }}
                />
                <ReferenceLine x={3.5} stroke="#22c55e" strokeDasharray="4 4" />
                <ReferenceLine x={2.5} stroke="#f59e0b" strokeDasharray="4 4" />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {sortedQuestions.map((q, i) => {
                    const risk =
                      q.avgScore >= 3.5
                        ? "low"
                        : q.avgScore >= 2.5
                        ? "medium"
                        : "high";
                    return <Cell key={i} fill={RISK_COLOR[risk]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                Healthy (≥3.5)
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-yellow-500" />
                Caution (2.5–3.5)
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-500" />
                At risk (&lt;2.5)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="mt-8 bg-slate-900 rounded-xl p-6 text-white text-center">
          <h3 className="font-semibold text-lg mb-2">Want to go deeper?</h3>
          <p className="text-slate-300 text-sm mb-4">
            Fugio Partners offers facilitated playback sessions to walk your
            leadership team through the results and identify next steps.
          </p>
          <Button variant="outline" className="text-white border-white hover:bg-white hover:text-slate-900">
            Schedule a playback session
          </Button>
        </div>
      </main>
    </div>
  );
}
