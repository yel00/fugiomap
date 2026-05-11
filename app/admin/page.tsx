"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  FileText,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPage() {
  const surveys = useQuery(api.surveys.listAll);
  const questions = useQuery(api.questions.list, { activeOnly: false });
  const toggleActive = useMutation(api.questions.toggleActive);
  const upsertQuestion = useMutation(api.questions.upsert);
  const seedQuestions = useMutation(api.questions.seed);

  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    category: "",
    polarity: "positive" as "positive" | "negative",
  });

  const handleSeedQuestions = async () => {
    const result = await seedQuestions();
    if ((result as any)?.seeded) {
      toast.success("Questions seeded successfully");
    } else {
      toast.info("Questions already seeded");
    }
  };

  const handleSaveQuestion = async () => {
    if (!newQuestion.text || !newQuestion.category) {
      toast.error("Text and category required");
      return;
    }
    const maxOrder = Math.max(...(questions ?? []).map((q) => q.order), 0);
    await upsertQuestion({
      ...newQuestion,
      order: maxOrder + 1,
      isActive: true,
      useCases: ["all"],
    });
    setNewQuestion({ text: "", category: "", polarity: "positive" });
    toast.success("Question saved");
  };

  const CATEGORIES = [
    "Business Leadership",
    "Product Management & Tech",
    "Competition & Markets",
    "Clients",
    "Sales, Marketing & Customer Service",
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded" />
            <span className="font-semibold text-slate-900">Fugio MAP Admin</span>
            <Badge variant="secondary" className="ml-2">Internal</Badge>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Exit admin</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-slate-400" />
              <div>
                <div className="text-2xl font-bold">{surveys?.length ?? 0}</div>
                <div className="text-sm text-slate-500">Total assessments</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <FileText className="w-8 h-8 text-slate-400" />
              <div>
                <div className="text-2xl font-bold">
                  {questions?.filter((q) => q.isActive).length ?? 0}
                </div>
                <div className="text-sm text-slate-500">Active questions</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <Users className="w-8 h-8 text-slate-400" />
              <div>
                <div className="text-2xl font-bold">
                  {surveys?.filter((s) => s.status === "active").length ?? 0}
                </div>
                <div className="text-sm text-slate-500">Active surveys</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="surveys">
          <TabsList>
            <TabsTrigger value="surveys">All Assessments</TabsTrigger>
            <TabsTrigger value="questions">Question Bank</TabsTrigger>
          </TabsList>

          {/* Assessments tab */}
          <TabsContent value="surveys" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">All assessments</CardTitle>
              </CardHeader>
              <CardContent>
                {!surveys ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : surveys.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4 text-center">
                    No assessments yet
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {surveys.map((s) => (
                      <div
                        key={s._id}
                        className="py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-sm">{s.name}</p>
                          <p className="text-xs text-slate-500">
                            {s.companyName} · {s.industry} · {s.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {s.status}
                          </Badge>
                          {s.status !== "setup" && (
                            <Link href={`/surveys/${s._id}/report`}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                                <BarChart3 className="w-3 h-3" />
                                Report
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions tab */}
          <TabsContent value="questions" className="mt-6 space-y-6">
            {/* Add question */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Question text</Label>
                  <Input
                    placeholder="We always..."
                    value={newQuestion.text}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewQuestion((p) => ({ ...p, text: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <select
                      className="w-full h-9 border border-slate-200 rounded-md px-2 text-sm bg-white"
                      value={newQuestion.category}
                      onChange={(e) =>
                        setNewQuestion((p) => ({
                          ...p,
                          category: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Polarity</Label>
                    <select
                      className="w-full h-9 border border-slate-200 rounded-md px-2 text-sm bg-white"
                      value={newQuestion.polarity}
                      onChange={(e) =>
                        setNewQuestion((p) => ({
                          ...p,
                          polarity: e.target.value as "positive" | "negative",
                        }))
                      }
                    >
                      <option value="positive">Positive (agree = healthy)</option>
                      <option value="negative">Negative (agree = risk)</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleSaveQuestion} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add question
                </Button>
              </CardContent>
            </Card>

            {/* Question list */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Question bank ({questions?.length ?? 0})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSeedQuestions}
                  >
                    Seed defaults
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!questions ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {questions.map((q) => (
                      <div key={q._id} className="py-3 flex items-start gap-3">
                        <button
                          onClick={() => toggleActive({ id: q._id })}
                          className="mt-0.5"
                          title={q.isActive ? "Deactivate" : "Activate"}
                        >
                          {q.isActive ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              q.isActive ? "text-slate-900" : "text-slate-400"
                            }`}
                          >
                            {q.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              {q.category}
                            </span>
                            <Badge
                              variant={
                                q.polarity === "positive" ? "default" : "secondary"
                              }
                              className="text-xs h-4 px-1.5"
                            >
                              {q.polarity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
