"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const SCALE_LABELS: Record<number, string> = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree",
};

export default function TakeSurveyPage() {
  const params = useParams();
  const token = params.token as string;

  const participant = useQuery(api.participants.getByToken, { token });
  const markStarted = useMutation(api.participants.markStarted);
  const markCompleted = useMutation(api.participants.markCompleted);
  const saveBulk = useMutation(api.responses.saveBulk);
  const questions = useQuery(api.questions.list, { activeOnly: true });

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const QUESTIONS_PER_PAGE = 6;

  useEffect(() => {
    if (participant && !started) {
      markStarted({ token });
      setStarted(true);
    }
  }, [participant, started, markStarted, token]);

  if (!participant || !questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (participant.status === "completed" || submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Survey complete
          </h1>
          <p className="text-slate-600">
            Thank you for completing the Fugio MAP assessment. Your responses
            have been recorded. You'll be notified when the report is ready.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const pageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / questions.length) * 100);

  const pageComplete = pageQuestions.every((q) => answers[q._id] !== undefined);

  const handleSubmit = async () => {
    if (answeredCount < questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }
    setSubmitting(true);
    try {
      const answerArray = Object.entries(answers).map(([questionId, score]) => ({
        questionId: questionId as Id<"questions">,
        score,
      }));
      await saveBulk({
        surveyId: participant.surveyId,
        participantId: participant._id,
        answers: answerArray,
      });
      await markCompleted({ participantId: participant._id });
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-900 rounded" />
              <span className="font-semibold text-slate-900 text-sm">Fugio MAP</span>
            </div>
            <span className="text-sm text-slate-500">
              {answeredCount} of {questions.length} answered
            </span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Welcome (page 0 before starting) */}
        {currentPage === 0 && answeredCount === 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h2 className="font-semibold text-blue-900 mb-1">
              Hi {participant.name} — welcome to your organizational diagnostic
            </h2>
            <p className="text-sm text-blue-700">
              You'll rate 32 statements about your organization. Be honest — there are no right or wrong
              answers. Your individual responses are confidential; only aggregate results are shown.
              It takes about 10–15 minutes.
            </p>
          </div>
        )}

        {/* Current page questions */}
        <div className="space-y-6">
          {pageQuestions.map((question, i) => (
            <QuestionCard
              key={question._id}
              question={question}
              value={answers[question._id]}
              onChange={(score) =>
                setAnswers((prev) => ({ ...prev, [question._id]: score }))
              }
              index={currentPage * QUESTIONS_PER_PAGE + i + 1}
              total={questions.length}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-sm text-slate-500">
            Page {currentPage + 1} of {totalPages}
          </span>

          {currentPage < totalPages - 1 ? (
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!pageComplete}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || answeredCount < questions.length}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Submit
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function QuestionCard({
  question,
  value,
  onChange,
  index,
  total,
}: {
  question: { _id: string; text: string; category: string; polarity: string };
  value: number | undefined;
  onChange: (score: number) => void;
  index: number;
  total: number;
}) {
  return (
    <Card className={value !== undefined ? "border-slate-300" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-5">
          <span className="text-xs font-mono text-slate-400 mt-0.5 flex-shrink-0">
            {index}/{total}
          </span>
          <div>
            <p className="text-xs text-slate-400 mb-1">{question.category}</p>
            <p className="text-slate-900 leading-relaxed">{question.text}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => onChange(score)}
              className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                value === score
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              {score}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-1.5 px-0.5">
          <span className="text-xs text-slate-400">{SCALE_LABELS[1]}</span>
          <span className="text-xs text-slate-400">{SCALE_LABELS[5]}</span>
        </div>
      </CardContent>
    </Card>
  );
}
