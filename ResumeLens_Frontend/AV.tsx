import { motion } from "motion/react";
import {
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Sparkles,
  Plus,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

import type { UploadedFile } from "@/components/dashboard/upload-panel";
import { analysis } from "@/lib/mock-data";

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={"hairline overflow-hidden rounded-2xl bg-surface shadow-soft " + className}
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-3.5">
        <h3 className="truncate text-[13px] font-medium">{title}</h3>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border-strong)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--popover-foreground)",
  boxShadow: "var(--shadow-soft)",
};

export function AnalysisView({ file }: { file: UploadedFile}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
      <Reveal>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-[18px]" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium">{file.name}</p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                {file.size} · analyzed just now · Senior Frontend Engineer
              </p>
            </div>
          </div>
          <span className="hairline shrink-0 rounded-full bg-success/10 px-3 py-1.5 text-[11.5px] font-medium text-success">
            Analysis complete
          </span>
        </div>
      </Reveal>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analysis.metrics.map((m, i) => (
          <Reveal key={m.label} delay={0.06 * i}>
            <article className="hairline group rounded-2xl bg-surface p-5 shadow-soft transition-colors hover:bg-surface-2">
              <p className="text-[12px] text-muted-foreground">{m.label}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <motion.span
                  className="text-[2rem] leading-none font-semibold tracking-[-0.03em]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                >
                  {m.value}
                </motion.span>
                <span className="text-[12px] text-muted-foreground">/100</span>
                <span className="ml-auto text-[11.5px] font-medium text-success">{m.delta}</span>
              </div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="bg-brand h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.06, ease }}
                />
              </div>
              <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">{m.hint}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <Reveal delay={0.16}>
          <Panel
            title="Resume preview"
            action={
              <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">
                Page 1 of 2
              </span>
            }
          >
            <div className="hairline rounded-xl bg-background/60 p-6">
              <div className="space-y-2">
                <div className="h-2.5 w-40 rounded-full bg-foreground/80" />
                <div className="h-1.5 w-56 rounded-full bg-muted-foreground/40" />
              </div>
              {[
                { w: ["92%", "84%", "72%"], label: "Experience" },
                { w: ["88%", "76%"], label: "Projects" },
                { w: ["64%", "48%"], label: "Skills" },
              ].map((block) => (
                <div key={block.label} className="mt-6">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-primary uppercase">
                    {block.label}
                  </p>
                  <div className="mt-3 space-y-2">
                    {block.w.map((w, i) => (
                      <motion.div
                        key={i}
                        initial={{ width: 0 }}
                        animate={{ width: w }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.08, ease }}
                        className="h-1.5 rounded-full bg-muted-foreground/30"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.22}>
          <Panel
            title="AI feedback"
            action={<Sparkles className="size-3.5 text-primary" />}
          >
            <p className="text-[13px] leading-relaxed text-muted-foreground">{analysis.summary}</p>
            <ul className="mt-5 space-y-px overflow-hidden rounded-xl border border-border bg-border">
              {analysis.feedback.map((f) => {
                const Icon =
                  f.tone === "good" ? CheckCircle2 : f.tone === "warn" ? AlertTriangle : XCircle;
                const color =
                  f.tone === "good"
                    ? "text-success"
                    : f.tone === "warn"
                      ? "text-warning"
                      : "text-destructive";
                return (
                  <li key={f.title} className="flex gap-3 bg-surface p-4">
                    <Icon className={"mt-0.5 size-4 shrink-0 " + color} strokeWidth={1.9} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium">{f.title}</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                        {f.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.26}>
          <Panel title="Detected skills">
            <div className="flex flex-wrap gap-2">
              {analysis.skills.map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.03, duration: 0.3 }}
                  className="hairline rounded-lg bg-surface-2 px-2.5 py-1.5 text-[12.5px]"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </Panel>
        </Reveal>
        <Reveal delay={0.3}>
          <Panel
            title="Missing skills"
            action={
              <span className="text-[11.5px] text-muted-foreground">
                Ranked by posting frequency
              </span>
            }
          >
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.32 + i * 0.04, duration: 0.3 }}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-border-strong px-2.5 py-1.5 text-[12.5px] text-muted-foreground"
                >
                  <Plus className="size-3 text-primary" />
                  {s}
                </motion.span>
              ))}
            </div>
          </Panel>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.34}>
          <Panel title="Dimension scores vs benchmark">
            <div className="h-[264px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analysis.radar} outerRadius="72%">
                  <PolarGrid stroke="var(--border-strong)" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Radar
                    dataKey="benchmark"
                    stroke="var(--muted-foreground)"
                    fill="var(--muted-foreground)"
                    fillOpacity={0.1}
                  />
                  <Radar
                    dataKey="score"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.24}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.38}>
          <Panel title="Section strength">
            <div className="h-[264px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.sections} barSize={20}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="section"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={28}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} />
                  <Bar dataKey="score" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.42}>
          <Panel title="Keyword coverage">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="h-[196px] w-full sm:w-[196px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysis.keywordSplit}
                      dataKey="value"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {["var(--primary)", "var(--violet)", "var(--muted)"].map((c) => (
                        <Cell key={c} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="w-full space-y-3">
                {analysis.keywordSplit.map((k, i) => (
                  <li key={k.name} className="flex items-center gap-3 text-[12.5px]">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        background: ["var(--primary)", "var(--violet)", "var(--muted)"][i],
                      }}
                    />
                    <span className="flex-1 text-muted-foreground">{k.name}</span>
                    <span className="font-medium">{k.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.46}>
          <Panel title="ATS score timeline">
            <div className="h-[196px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analysis.timeline}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={28}
                    domain={[40, 100]}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#scoreFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Reveal delay={0.5}>
          <Panel
            title="Recommended roles"
            action={
              <span className="text-[11.5px] text-muted-foreground">Matched to your profile</span>
            }
          >
            <ul className="space-y-px overflow-hidden rounded-xl border border-border bg-border">
              {analysis.jobs.map((j) => (
                <li
                  key={j.role}
                  className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 bg-surface p-4 transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">{j.role}</p>
                    <p className="mt-1 truncate text-[12px] text-muted-foreground">
                      {j.company} · {j.location} · {j.salary}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[12.5px] font-medium text-primary">{j.match}%</span>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>

        <Reveal delay={0.54}>
          <Panel title="Salary insights" action={<span className="text-[11.5px] text-muted-foreground">USD, base</span>}>
            <ul className="space-y-5">
              {analysis.salary.map((s) => (
                <li key={s.role}>
                  <div className="flex items-baseline justify-between text-[12.5px]">
                    <span className="font-medium">{s.role}</span>
                    <span className="text-muted-foreground">
                      ${s.low}k – ${s.high}k
                    </span>
                  </div>
                  <div className="relative mt-2.5 h-1.5 rounded-full bg-muted">
                    <motion.div
                      className="bg-brand absolute h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((s.high - s.low) / 220) * 100}%` }}
                      style={{ left: `${(s.low / 220) * 100}%` }}
                      transition={{ duration: 0.8, ease }}
                    />
                    <span
                      className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-primary"
                      style={{ left: `${(s.mid / 220) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11.5px] text-muted-foreground">
                    Median ${s.mid}k for your matched skill set
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}