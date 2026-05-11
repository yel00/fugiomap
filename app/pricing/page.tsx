import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "$499",
    period: "per assessment",
    desc: "One-time diagnostic for a single product or team.",
    features: [
      "Up to 10 participants",
      "32-question assessment",
      "Interactive report dashboard",
      "PDF export",
      "30-day access to results",
    ],
    cta: "Get started",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$999",
    period: "per assessment",
    desc: "Full team diagnostic with unlimited participants and deeper analysis.",
    features: [
      "Unlimited participants",
      "32-question assessment",
      "Interactive report dashboard",
      "PDF + PowerPoint export",
      "90-day access to results",
      "Fugio playback session (1hr)",
    ],
    cta: "Most popular",
    href: "/sign-up",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    desc: "Ongoing diagnostics, multi-product tracking, and advisory support.",
    features: [
      "Everything in Growth",
      "Multiple assessments",
      "Trend tracking over time",
      "Dedicated Fugio advisor",
      "Custom question sets",
      "Slack / priority support",
    ],
    cta: "Talk to us",
    href: "mailto:map@fugiopartners.com",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-xl mx-auto">
            One assessment gives you everything you need to understand what's
            holding your product back.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? "border-slate-900 border-2 shadow-lg"
                  : ""
              }
            >
              <CardHeader className="pb-4">
                {plan.highlighted && (
                  <div className="inline-flex w-fit bg-slate-900 text-white text-xs font-medium px-2.5 py-1 rounded-full mb-3">
                    Most popular
                  </div>
                )}
                <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                <div>
                  <span className="text-3xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-slate-500 text-sm ml-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">{plan.desc}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className="w-full mt-2"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.highlighted ? plan.cta : plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-4">
            Not sure which plan is right for you?
          </p>
          <Link href="mailto:map@fugiopartners.com">
            <Button variant="outline">Talk to the team</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
