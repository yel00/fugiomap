"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Assessment name is required"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  location: z.string().min(1, "Location is required"),
});

type FormData = z.infer<typeof schema>;

const INDUSTRIES = [
  "Software / SaaS",
  "Healthcare / Health Tech",
  "Financial Services / FinTech",
  "E-Commerce / Retail",
  "Media / Publishing",
  "Professional Services",
  "Manufacturing",
  "Education / EdTech",
  "Real Estate",
  "Other",
];

export default function NewSurveyPage() {
  const { user } = useUser();
  const router = useRouter();
  const createSurvey = useMutation(api.surveys.create);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      const id = await createSurvey({
        clerkOrgId: user.organizationMemberships?.[0]?.organization?.id ?? user.id,
        clerkUserId: user.id,
        name: data.name,
        companyName: data.companyName,
        industry: data.industry,
        location: data.location,
      });
      router.push(`/surveys/${id}/setup`);
    } catch (err) {
      toast.error("Failed to create assessment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <span className="text-slate-300">·</span>
          <span className="text-sm text-slate-600">New assessment</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create assessment</h1>
          <p className="text-slate-500 mt-1">
            Set up your organizational diagnostic. You'll add participants next.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="name">Assessment name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Q2 2025 MAP Assessment"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Corp"
                  {...register("companyName")}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Select
                  onValueChange={(v: string | null) => setValue("industry", v ?? "")}
                  defaultValue={watch("industry") ?? undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-red-500">
                    {errors.industry.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Location / HQ</Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco, CA"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create assessment and add participants
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
