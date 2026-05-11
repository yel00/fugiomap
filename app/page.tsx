import Link from "next/link";
import { ArrowRight, BarChart3, Users, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Business Leadership",
  "Product Management & Tech",
  "Competition & Markets",
  "Clients",
  "Sales, Marketing & Customer Service",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded" />
            <span className="font-semibold text-slate-900 text-lg">Fugio MAP</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900">
              Pricing
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 text-sm text-slate-600 mb-6">
            <Zap className="w-3.5 h-3.5" />
            Built on 5+ years of product failure research
          </div>
          <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
            Find out exactly why your product isn't scaling
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            The Fugio MAP diagnostic surveys your entire team, analyzes alignment gaps across 5 business domains,
            and surfaces the root causes holding your product back — in under 30 minutes.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start your diagnostic <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">See pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Three steps to clarity
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Set up your assessment",
                desc: "Add your team members and send them a personalized survey link. Takes 5 minutes.",
              },
              {
                step: "02",
                title: "Team completes the survey",
                desc: "Each person rates 32 statements across 5 domains. About 10–15 minutes per person.",
              },
              {
                step: "03",
                title: "Get your diagnostic report",
                desc: "See exactly where your team is aligned, where gaps exist, and which issues are highest risk.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-8 border border-slate-200">
                <div className="text-4xl font-bold text-slate-200 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              5 domains. 32 questions. Dozens of insights.
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Built on an enhanced root-cause analysis of product failure drawn from hundreds of company case studies,
              academic research, and pattern analysis across industries.
            </p>
            <ul className="space-y-3">
              {CATEGORIES.map((cat) => (
                <li key={cat} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {cat}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-900 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-slate-400" />
              <span className="text-slate-400 text-sm">Sample diagnostic output</span>
            </div>
            {CATEGORIES.map((cat, i) => {
              const score = [3.8, 2.4, 4.1, 3.2, 2.7][i];
              const pct = (score / 5) * 100;
              const color =
                score >= 3.5
                  ? "bg-green-500"
                  : score >= 2.5
                  ? "bg-yellow-500"
                  : "bg-red-500";
              return (
                <div key={cat} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-300 truncate max-w-48">{cat}</span>
                    <span className="text-sm text-white font-medium">{score}/5</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Used by product teams across industries
          </h2>
          <p className="text-slate-600 mb-12">
            From pre-seed startups to Series B companies, Fugio MAP has helped teams
            identify and fix the gaps holding their products back.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                stat: "32",
                label: "diagnostic questions",
                sub: "across 5 business domains",
              },
              {
                stat: "15 min",
                label: "average survey time",
                sub: "per team member",
              },
              {
                stat: "5+",
                label: "years of research",
                sub: "behind the methodology",
              },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="text-3xl font-bold text-slate-900 mb-1">{item.stat}</div>
                <div className="text-slate-700 font-medium">{item.label}</div>
                <div className="text-slate-500 text-sm">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Ready to find out what's holding you back?
        </h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          Get your team's diagnostic report in under 24 hours.
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="gap-2">
            Start your diagnostic <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
          <span>© 2025 Fugio Partners. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
