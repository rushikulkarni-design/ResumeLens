import { motion } from "motion/react";
import {
  ScanLine,
  Target,
  GaugeCircle,
  Sparkles,
  ShieldCheck,
  LineChart,
  Minus,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand";

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
      <h2 className="mt-4 text-[1.75rem] leading-tight font-semibold sm:text-4xl">{title}</h2>
      {copy && <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{copy}</p>}
    </div>
  );
}

const features = [
  {
    icon: ScanLine,
    title: "ATS parse simulation",
    body: "We run your file through the same extraction pipeline used by Workday, Greenhouse and Lever, then show exactly what survives.",
  },
  {
    icon: Target,
    title: "Role-aware keyword gaps",
    body: "Every missing skill is ranked by how often it appears in live postings for the role you are targeting.",
  },
  {
    icon: GaugeCircle,
    title: "Hiring probability",
    body: "A calibrated estimate against 4,000+ anonymised outcomes for comparable profiles and seniority.",
  },
  {
    icon: Sparkles,
    title: "Line-level rewrites",
    body: "Suggestions are attached to the exact bullet they improve — no generic advice, no filler.",
  },
  {
    icon: LineChart,
    title: "Version tracking",
    body: "Each upload is scored and stored so you can see whether an edit actually moved the number.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Files are processed in memory, never used for training, and removable in one click.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything a screener sees, before they see it"
          copy="ResumeLens replaces guesswork with the signals recruiters and automated filters actually score."
        />
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
              className="group bg-surface p-7 transition-colors hover:bg-surface-2"
            >
              <f.icon className="size-[18px] text-primary" strokeWidth={1.75} />
              <h3 className="mt-5 text-[15px] font-medium">{f.title}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-foreground">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    n: "01",
    title: "Choose the target role",
    body: "Scoring adapts to seniority and function, so feedback is never one-size-fits-all.",
  },
  {
    n: "02",
    title: "Upload your PDF",
    body: "Drag it in. We extract structure, dates, sections and links the way a parser would.",
  },
  {
    n: "03",
    title: "Fix, re-upload, compare",
    body: "Apply the suggestions and watch the ATS score move across versions in your history.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps, about ninety seconds"
          copy="No onboarding wizard, no template library to browse. Upload, read, improve."
        />
        <ol className="relative">
          <div className="absolute top-2 bottom-2 left-[15px] w-px bg-border" />
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative flex gap-5 pb-10 last:pb-0"
            >
              <span className="hairline z-10 grid size-8 shrink-0 place-items-center rounded-full bg-surface font-mono text-[11px] text-primary">
                {s.n}
              </span>
              <div className="min-w-0 pt-1">
                <h3 className="text-[15px] font-medium">{s.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const quotes = [
  {
    quote:
      "The keyword gap list was uncomfortably accurate. Three edits later I had two callbacks from companies that had ghosted me.",
    name: "Priya Nandakumar",
    role: "Product Engineer, ex-Zoho",
  },
  {
    quote:
      "I have reviewed thousands of resumes. ResumeLens flags the same things I do, in less time than it takes me to open the file.",
    name: "Daniel Okafor",
    role: "Technical Recruiter, Series B fintech",
  },
  {
    quote:
      "Version history is the part nobody else does. Being able to prove an edit raised the score changed how I write bullets.",
    name: "Mei Lin Zhao",
    role: "New grad, CS '26",
  },
];

const faqs = [
  {
    q: "Which file formats can I upload?",
    a: "PDF only. It is the format every applicant tracking system expects, and it is the only one where layout parsing can be verified reliably.",
  },
  {
    q: "Is the ATS score a real number?",
    a: "It is a composite of parse fidelity, keyword coverage, section completeness and formatting risk. We show each contributing sub-score so nothing is a black box.",
  },
  {
    q: "Do you store my resume?",
    a: "Only if you keep it in history. Files are processed in memory and can be deleted permanently at any time from Settings.",
  },
  {
    q: "Does it work for non-engineering roles?",
    a: "Yes. Scoring models cover product, design, data, marketing, operations and finance tracks, with role-specific keyword sets.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SectionHeading eyebrow="FAQ" title="Details worth knowing" />
        <div className="divide-y divide-border border-y border-border">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="ring-focus flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="text-[14.5px] font-medium">{f.q}</span>
                {open === i ? (
                  <Minus className="size-4 shrink-0 text-primary" />
                ) : (
                  <Plus className="size-4 shrink-0 text-muted-foreground" />
                )}
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="pr-10 pb-6 text-[13.5px] leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-end">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[13.5px] leading-relaxed text-muted-foreground">
              Resume intelligence for candidates who would rather know than guess.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-14 gap-y-3 text-[13px] sm:grid-cols-2">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              Analyze
            </Link>
            <Link to="/login" className="text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link to="/signup" className="text-muted-foreground hover:text-foreground">
              Create account
            </Link>
            <a href="#features" className="text-muted-foreground hover:text-foreground">
              Capabilities
            </a>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ResumeLens. All rights reserved.</p>
          <p className="font-mono tracking-[0.14em] uppercase">Built for shortlists</p>
        </div>
      </div>
    </footer>
  );
}
