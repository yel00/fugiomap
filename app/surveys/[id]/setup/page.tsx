"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Users,
  Mail,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const COMMON_ROLES = [
  "CEO / Co-founder",
  "COO",
  "CTO",
  "CPO",
  "CMO",
  "VP Sales",
  "VP Engineering",
  "VP Product",
  "VP Marketing",
  "Head of CS",
  "Product Manager",
  "Engineer",
  "Sales",
  "Marketing",
  "Other",
];

interface ParticipantRow {
  name: string;
  email: string;
  role: string;
}

export default function SetupPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as Id<"surveys">;

  const survey = useQuery(api.surveys.get, { id: surveyId });
  const existingParticipants = useQuery(api.participants.listBySurvey, {
    surveyId,
  });

  const addParticipants = useMutation(api.participants.addBulk);
  const removeParticipant = useMutation(api.participants.remove);
  const activateSurvey = useMutation(api.surveys.activate);
  const updateSurvey = useMutation(api.surveys.update);

  const [rows, setRows] = useState<ParticipantRow[]>([
    { name: "", email: "", role: "" },
  ]);
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState<"participants" | "email" | "confirm">(
    "participants"
  );

  const addRow = () =>
    setRows((prev) => [...prev, { name: "", email: "", role: "" }]);

  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));

  const updateRow = (i: number, field: keyof ParticipantRow, val: string) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r))
    );

  const validRows = rows.filter(
    (r) => r.name.trim() && r.email.trim() && r.role.trim()
  );

  const handleSaveParticipants = async () => {
    if (validRows.length === 0) {
      toast.error("Add at least one participant");
      return;
    }
    try {
      await addParticipants({ surveyId, participants: validRows });
      setRows([{ name: "", email: "", role: "" }]);
      setStep("email");
    } catch {
      toast.error("Failed to save participants");
    }
  };

  const handleLaunch = async () => {
    setSending(true);
    try {
      if (customMessage) {
        await updateSurvey({
          id: surveyId,
          customEmailMessage: customMessage,
        });
      }

      // Send invites
      const participants = existingParticipants ?? [];
      for (const p of participants) {
        await fetch("/api/email/send-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            surveyId,
            participantId: p._id,
            email: p.email,
            name: p.name,
            token: p.token,
            surveyName: survey?.name,
            companyName: survey?.companyName,
            customMessage,
          }),
        });
      }

      await activateSurvey({ id: surveyId });
      router.push(`/surveys/${surveyId}/status`);
    } catch {
      toast.error("Failed to launch survey");
      setSending(false);
    }
  };

  if (!survey) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
    </div>;
  }

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
          <Badge variant="secondary" className="ml-auto">Setup</Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {(["participants", "email", "confirm"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === s
                    ? "bg-slate-900 text-white"
                    : ["email", "confirm"].includes(step) && i < ["participants", "email", "confirm"].indexOf(step)
                    ? "bg-green-500 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {["email", "confirm"].includes(step) && i < ["participants", "email", "confirm"].indexOf(step) ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-sm ${
                  step === s ? "text-slate-900 font-medium" : "text-slate-500"
                }`}
              >
                {s === "participants"
                  ? "Add participants"
                  : s === "email"
                  ? "Customize email"
                  : "Launch"}
              </span>
              {i < 2 && <div className="w-8 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        {step === "participants" && (
          <>
            {/* Existing participants */}
            {existingParticipants && existingParticipants.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Added participants ({existingParticipants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {existingParticipants.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                      >
                        <div>
                          <span className="text-sm font-medium text-slate-900">
                            {p.name}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            {p.role}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            {p.email}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant({ id: p._id })}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add participants</CardTitle>
                <p className="text-sm text-slate-500">
                  Add everyone you want to take the survey. They'll receive an
                  email with a personal link.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rows.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1.5fr_1.2fr_auto] gap-2 items-start">
                      <div>
                        {i === 0 && (
                          <Label className="text-xs mb-1 block">Name</Label>
                        )}
                        <Input
                          placeholder="Jane Smith"
                          value={row.name}
                          onChange={(e) => updateRow(i, "name", e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        {i === 0 && (
                          <Label className="text-xs mb-1 block">Email</Label>
                        )}
                        <Input
                          placeholder="jane@company.com"
                          type="email"
                          value={row.email}
                          onChange={(e) => updateRow(i, "email", e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        {i === 0 && (
                          <Label className="text-xs mb-1 block">Role</Label>
                        )}
                        <select
                          value={row.role}
                          onChange={(e) => updateRow(i, "role", e.target.value)}
                          className="w-full h-9 text-sm border border-slate-200 rounded-md px-2 bg-white"
                        >
                          <option value="">Select role</option>
                          {COMMON_ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      <div className={i === 0 ? "mt-5" : ""}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(i)}
                          disabled={rows.length === 1}
                          className="h-9 w-9"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                    className="gap-2 mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add another
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep("email")}
                disabled={(existingParticipants ?? []).length === 0}
              >
                Skip — use existing
              </Button>
              <Button
                onClick={handleSaveParticipants}
                disabled={validRows.length === 0}
                className="gap-2"
              >
                Save and continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {step === "email" && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Customize invitation email
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Add a personal note to the survey invitation. Optional — a
                  default message will be used if left blank.
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Hey team — I'm asking everyone to take a quick organizational diagnostic. It takes about 10-15 minutes and the results will help us identify where to focus. Thanks!"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={5}
                />
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep("participants")}>
                Back
              </Button>
              <Button onClick={() => setStep("confirm")} className="gap-2">
                Review and launch
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ready to launch?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Assessment</p>
                    <p className="font-medium">{survey.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Company</p>
                    <p className="font-medium">{survey.companyName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Participants</p>
                    <p className="font-medium">
                      {existingParticipants?.length ?? 0} people
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Questions</p>
                    <p className="font-medium">32 questions</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4 text-sm text-slate-600">
                  Each participant will receive a personalized email with their
                  survey link. The survey can be completed on any device.
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep("email")}>
                Back
              </Button>
              <Button
                onClick={handleLaunch}
                disabled={sending}
                className="gap-2"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Launch and send invites
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
