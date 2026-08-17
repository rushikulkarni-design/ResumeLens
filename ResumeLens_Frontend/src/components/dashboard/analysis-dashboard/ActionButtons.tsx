import { useState } from "react";

import {
  Download,
  UploadCloud,
} from "lucide-react";

import { toast } from "sonner";
import jsPDF from "jspdf";

interface Props {
  file: any;
  analysis: any;
}

/* ============================================================
   TYPES
============================================================ */

type RGB = [number, number, number];

interface Recommendation {
  skill?: string;
  group?: string;
  importance?: string;
  priority?: string;
  status?: string;
  title?: string;
  action?: string;
  resume_guidance?: string;
}

interface CoverageItem {
  percentage?: number;
  matched_skills?: string[];
  missing_skills?: string[];
}

interface Feedback {
  strengths?: unknown;
  weaknesses?: unknown;
  suggestions?: unknown;
}

/* ============================================================
   COLORS
============================================================ */

const COLORS = {
  navy: [15, 23, 42] as RGB,
  navyLight: [30, 41, 59] as RGB,

  blue: [37, 99, 235] as RGB,
  blueLight: [239, 246, 255] as RGB,

  green: [22, 163, 74] as RGB,
  greenLight: [240, 253, 244] as RGB,

  yellow: [217, 119, 6] as RGB,
  yellowLight: [255, 251, 235] as RGB,

  red: [220, 38, 38] as RGB,
  redLight: [254, 242, 242] as RGB,

  purple: [124, 58, 237] as RGB,
  purpleLight: [245, 243, 255] as RGB,

  orange: [234, 88, 12] as RGB,
  orangeLight: [255, 247, 237] as RGB,

  text: [15, 23, 42] as RGB,
  muted: [100, 116, 139] as RGB,

  border: [226, 232, 240] as RGB,
  background: [248, 250, 252] as RGB,
  white: [255, 255, 255] as RGB,
};

/* ============================================================
   BASIC HELPERS
============================================================ */

function safeText(value: unknown): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function safeNumber(
  value: unknown,
  fallback = 0
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

function clampScore(
  value: unknown
): number {
  return Math.max(
    0,
    Math.min(
      100,
      safeNumber(value)
    )
  );
}

function normalizeArray(
  value: unknown
): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (
          typeof item === "string"
        ) {
          return item;
        }

        if (
          item &&
          typeof item === "object"
        ) {
          const objectItem =
            item as Record<
              string,
              unknown
            >;

          return (
            safeText(
              objectItem["skill"]
            ) ||
            safeText(
              objectItem["title"]
            ) ||
            safeText(
              objectItem["name"]
            ) ||
            safeText(
              objectItem["description"]
            ) ||
            safeText(
              objectItem["text"]
            ) ||
            safeText(
              objectItem["message"]
            )
          );
        }

        return "";
      })
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  if (
    typeof value === "string"
  ) {
    return value
      .split(/\n|•|,/)
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  return [];
}

function parseFeedback(
  value: unknown
): Feedback {
  if (
    value &&
    typeof value ===
      "object"
  ) {
    return value as Feedback;
  }

  if (
    typeof value ===
    "string"
  ) {
    try {
      const parsed =
        JSON.parse(value);

      if (
        parsed &&
        typeof parsed ===
          "object"
      ) {
        return parsed as Feedback;
      }
    } catch {
      return {};
    }
  }

  return {};
}

function getScore(
  analysis: any
): number {
  return clampScore(
    analysis?.final_score ??
      analysis?.resume_score ??
      analysis?.ats_score ??
      analysis?.score ??
      analysis?.technical_score ??
      0
  );
}

function getRole(
  analysis: any
): string {
  return (
    safeText(
      analysis?.job_title
    ) ||
    safeText(
      analysis?.target_role
    ) ||
    safeText(
      analysis?.recommended_role
    ) ||
    safeText(
      analysis?.role
    ) ||
    "Software Developer"
  );
}

function getScoreLabel(
  score: number
): string {
  if (score >= 80) {
    return "Excellent";
  }

  if (score >= 60) {
    return "Good";
  }

  if (score >= 40) {
    return "Needs Improvement";
  }

  return "Needs Attention";
}

function getPriorityColor(
  priority: string
): {
  text: RGB;
  background: RGB;
} {
  const value =
    priority.toLowerCase();

  if (value === "high") {
    return {
      text: COLORS.red,
      background:
        COLORS.redLight,
    };
  }

  if (
    value === "low"
  ) {
    return {
      text: COLORS.green,
      background:
        COLORS.greenLight,
    };
  }

  return {
    text: COLORS.yellow,
    background:
      COLORS.yellowLight,
  };
}

/* ============================================================
   PDF GENERATOR
============================================================ */

function generateAnalysisPDF(
  file: any,
  analysis: any
): void {
  const pdf =
    new jsPDF({
      orientation:
        "portrait",
      unit: "mm",
      format: "a4",
    });

  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();

  const margin = 15;

  const contentWidth =
    pageWidth -
    margin * 2;

  let y = 0;

  /* ==========================================================
     DATA EXTRACTION
  ========================================================== */

  const score =
    getScore(analysis);

  const role =
    getRole(analysis);

  const fileName =
    safeText(
      file?.name
    ) || "Resume";

  const skills =
    normalizeArray(
      analysis?.skills
    );

  const exactMatches =
    normalizeArray(
      analysis?.exact_matches
    );

  const relatedMatches =
    normalizeArray(
      analysis?.related_matches
    );

  const contextualMatches =
    normalizeArray(
      analysis?.contextual_matches
    );

  const missingSkills =
    normalizeArray(
      analysis?.missing_skills
    );

  const recommendations: Recommendation[] =
    Array.isArray(
      analysis?.skill_recommendations
    )
      ? analysis.skill_recommendations
      : [];

  const feedback =
    parseFeedback(
      analysis?.ai_feedback ??
        analysis?.feedback
    );

  const strengths =
    normalizeArray(
      feedback.strengths
    );

  const weaknesses =
    normalizeArray(
      feedback.weaknesses
    );

  const suggestions =
    normalizeArray(
      feedback.suggestions
    );

  const skillGroups =
    analysis?.skill_groups &&
    typeof analysis.skill_groups ===
      "object"
      ? analysis.skill_groups
      : {};

  const groupCoverage =
    analysis?.group_coverage &&
    typeof analysis.group_coverage ===
      "object"
      ? analysis.group_coverage
      : {};

  /* ==========================================================
     GENERAL PDF HELPERS
  ========================================================== */

  const setFill =
    (color: RGB) => {
      pdf.setFillColor(
        color[0],
        color[1],
        color[2]
      );
    };

  const setText =
    (color: RGB) => {
      pdf.setTextColor(
        color[0],
        color[1],
        color[2]
      );
    };

  const setDraw =
    (color: RGB) => {
      pdf.setDrawColor(
        color[0],
        color[1],
        color[2]
      );
    };

  const resetText =
    () => {
      setText(
        COLORS.text
      );
    };

  const roundedCard = (
    x: number,
    top: number,
    width: number,
    height: number,
    fill: RGB = COLORS.white,
    border: RGB = COLORS.border,
    radius = 4
  ) => {
    setFill(fill);
    setDraw(border);

    pdf.setLineWidth(
      0.25
    );

    pdf.roundedRect(
      x,
      top,
      width,
      height,
      radius,
      radius,
      "FD"
    );
  };

  const addPageBackground =
    () => {
      setFill(
        COLORS.background
      );

      pdf.rect(
        0,
        0,
        pageWidth,
        pageHeight,
        "F"
      );
    };

  const addPageHeader = (
    pageTitle: string,
    pageNumber: number
  ) => {
    setFill(
      COLORS.navy
    );

    pdf.rect(
      0,
      0,
      pageWidth,
      18,
      "F"
    );

    setText(
      COLORS.white
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      8.5
    );

    pdf.text(
      "ResumeLens",
      margin,
      11
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      7.5
    );

    pdf.text(
      pageTitle,
      pageWidth / 2,
      11,
      {
        align:
          "center",
      }
    );

    pdf.text(
      `Page ${pageNumber}`,
      pageWidth -
        margin,
      11,
      {
        align:
          "right",
      }
    );

    y = 27;

    resetText();
  };

  const addFooter = (
    pageNumber: number
  ) => {
    setDraw(
      COLORS.border
    );

    pdf.setLineWidth(
      0.2
    );

    pdf.line(
      margin,
      pageHeight - 12,
      pageWidth -
        margin,
      pageHeight - 12
    );

    setText(
      COLORS.muted
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      7
    );

    pdf.text(
      "ResumeLens Resume Analyzer",
      margin,
      pageHeight - 6
    );

    pdf.text(
      `Page ${pageNumber}`,
      pageWidth -
        margin,
      pageHeight - 6,
      {
        align:
          "right",
      }
    );

    resetText();
  };

  const addSectionTitle = (
    title: string,
    subtitle?: string
  ) => {
    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      15
    );

    setText(
      COLORS.navy
    );

    pdf.text(
      title,
      margin,
      y
    );

    y += 6;

    if (subtitle) {
      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        8.5
      );

      setText(
        COLORS.muted
      );

      const lines =
        pdf.splitTextToSize(
          subtitle,
          contentWidth
        );

      pdf.text(
        lines,
        margin,
        y
      );

      y +=
        lines.length *
          4 +
        3;
    }

    resetText();
  };

  const addParagraph = (
    text: string,
    fontSize = 9
  ) => {
    if (!text) {
      return;
    }

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      fontSize
    );

    setText(
      COLORS.text
    );

    const lines =
      pdf.splitTextToSize(
        text,
        contentWidth
      );

    pdf.text(
      lines,
      margin,
      y
    );

    y +=
      lines.length *
        (fontSize <= 8
          ? 3.8
          : 4.5) +
      3;
  };

  const addBulletList = (
    items: string[],
    width = contentWidth
  ) => {
    for (
      const item of items
    ) {
      const clean =
        safeText(item);

      if (!clean) {
        continue;
      }

      const lines =
        pdf.splitTextToSize(
          clean,
          width - 7
        );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        8.5
      );

      setFill(
        COLORS.blue
      );

      pdf.circle(
        margin + 2,
        y - 1.2,
        0.8,
        "F"
      );

      setText(
        COLORS.text
      );

      pdf.text(
        lines,
        margin + 6,
        y
      );

      y +=
        lines.length * 4 +
        2.5;
    }

    resetText();
  };

  const addProgressBar = (
    label: string,
    percentage: number,
    color: RGB
  ) => {
    const safePercentage =
      Math.max(
        0,
        Math.min(
          100,
          percentage
        )
      );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      8
    );

    setText(
      COLORS.text
    );

    pdf.text(
      label,
      margin,
      y
    );

    setText(
      color
    );

    pdf.text(
      `${Math.round(
        safePercentage
      )}%`,
      pageWidth -
        margin,
      y,
      {
        align:
          "right",
      }
    );

    y += 3.5;

    setFill(
      [226, 232, 240]
    );

    pdf.roundedRect(
      margin,
      y,
      contentWidth,
      3,
      1.5,
      1.5,
      "F"
    );

    if (
      safePercentage >
      0
    ) {
      setFill(color);

      pdf.roundedRect(
        margin,
        y,
        (contentWidth *
          safePercentage) /
          100,
        3,
        1.5,
        1.5,
        "F"
      );
    }

    y += 8;

    resetText();
  };

  const addTag = (
    text: string,
    color: RGB,
    background: RGB,
    x: number,
    top: number,
    maxWidth: number
  ): number => {
    const clean =
      safeText(text);

    if (!clean) {
      return 0;
    }

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      7.2
    );

    const textWidth =
      pdf.getTextWidth(
        clean
      );

    const width =
      Math.min(
        maxWidth,
        textWidth + 9
      );

    setFill(
      background
    );

    setDraw(
      color
    );

    pdf.roundedRect(
      x,
      top,
      width,
      7,
      2,
      2,
      "FD"
    );

    setText(color);

    pdf.text(
      clean,
      x + 4.5,
      top + 4.7
    );

    resetText();

    return width;
  };

  const addTagGrid = (
    items: string[],
    color: RGB,
    background: RGB
  ) => {
    let x = margin;

    let rowY = y;

    const gap = 3;

    const maxTagWidth =
      48;

    for (
      const item of items
    ) {
      const clean =
        safeText(item);

      if (!clean) {
        continue;
      }

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        7.2
      );

      const estimatedWidth =
        Math.min(
          maxTagWidth,
          pdf.getTextWidth(
            clean
          ) + 9
        );

      if (
        x +
          estimatedWidth >
        pageWidth -
          margin
      ) {
        x = margin;
        rowY += 10;
      }

      addTag(
        clean,
        color,
        background,
        x,
        rowY,
        maxTagWidth
      );

      x +=
        estimatedWidth +
        gap;
    }

    y =
      rowY + 13;

    resetText();
  };

  const addMetricCard = (
    x: number,
    top: number,
    width: number,
    title: string,
    value: string,
    description: string,
    color: RGB,
    lightColor: RGB
  ) => {
    roundedCard(
      x,
      top,
      width,
      38,
      COLORS.white,
      COLORS.border
    );

    setFill(
      lightColor
    );

    pdf.roundedRect(
      x + 5,
      top + 5,
      9,
      9,
      2,
      2,
      "F"
    );

    setText(color);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      13
    );

    pdf.text(
      value,
      x + 18,
      top + 12
    );

    setText(
      COLORS.text
    );

    pdf.setFontSize(
      7.5
    );

    pdf.text(
      title,
      x + 5,
      top + 22
    );

    setText(
      COLORS.muted
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      6.5
    );

    const lines =
      pdf.splitTextToSize(
        description,
        width - 10
      );

    pdf.text(
      lines.slice(0, 2),
      x + 5,
      top + 27
    );

    resetText();
  };

  /* ==========================================================
     PAGE 1 — EXECUTIVE SUMMARY
  ========================================================== */

  addPageBackground();

  setFill(
    COLORS.navy
  );

  pdf.rect(
    0,
    0,
    pageWidth,
    54,
    "F"
  );

  setText(
    COLORS.white
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    24
  );

  pdf.text(
    "AI Resume",
    margin,
    22
  );

  pdf.text(
    "Analysis Report",
    margin,
    32
  );

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(
    8.5
  );

  pdf.text(
    "Professional ATS and resume intelligence report",
    margin,
    42
  );

  pdf.setFontSize(
    7.5
  );

  pdf.text(
    fileName,
    pageWidth -
      margin,
    22,
    {
      align:
        "right",
    }
  );

  pdf.text(
    `Target role: ${role}`,
    pageWidth -
      margin,
    29,
    {
      align:
        "right",
    }
  );

  pdf.text(
    getScoreLabel(score),
    pageWidth -
      margin,
    42,
    {
      align:
        "right",
    }
  );

  resetText();

  y = 64;

  /* ATS SCORE CARD */

  roundedCard(
    margin,
    y,
    contentWidth,
    60,
    COLORS.white,
    COLORS.border
  );

  setFill(
    COLORS.blueLight
  );

  pdf.circle(
    margin + 32,
    y + 30,
    21,
    "F"
  );

  setText(
    COLORS.blue
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    23
  );

  pdf.text(
    `${Math.round(
      score
    )}`,
    margin + 32,
    y + 27,
    {
      align:
        "center",
    }
  );

  pdf.setFontSize(
    8
  );

  pdf.text(
    "/ 100",
    margin + 32,
    y + 35,
    {
      align:
        "center",
    }
  );

  setText(
    COLORS.navy
  );

  pdf.setFontSize(
    13
  );

  pdf.text(
    "ATS Compatibility Score",
    margin + 65,
    y + 18
  );

  setText(
    COLORS.muted
  );

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(
    8.5
  );

  const scoreDescription =
    score >= 80
      ? "Your resume demonstrates strong alignment with the selected role."
      : score >= 60
        ? "Your resume has a reasonable foundation but can be strengthened."
        : "Your resume needs stronger role alignment, keywords and evidence.";

  const scoreLines =
    pdf.splitTextToSize(
      scoreDescription,
      contentWidth - 85
    );

  pdf.text(
    scoreLines,
    margin + 65,
    y + 25
  );

  setText(
    score >= 60
      ? COLORS.green
      : COLORS.red
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    8
  );

  pdf.text(
    getScoreLabel(score),
    margin + 65,
    y + 42
  );

  resetText();

  y += 70;

  /* METRICS */

  const metricGap = 4;

  const metricWidth =
    (contentWidth -
      metricGap * 3) /
    4;

  addMetricCard(
    margin,
    y,
    metricWidth,
    "Skills Detected",
    String(
      skills.length
    ),
    "Skills identified from your resume.",
    COLORS.purple,
    COLORS.purpleLight
  );

  addMetricCard(
    margin +
      (metricWidth +
        metricGap),
    y,
    metricWidth,
    "Direct Matches",
    String(
      exactMatches.length
    ),
    "Skills directly matching the role.",
    COLORS.green,
    COLORS.greenLight
  );

  addMetricCard(
    margin +
      (metricWidth +
        metricGap) *
        2,
    y,
    metricWidth,
    "Related Matches",
    String(
      relatedMatches.length +
        contextualMatches.length
    ),
    "Related or contextual evidence.",
    COLORS.blue,
    COLORS.blueLight
  );

  addMetricCard(
    margin +
      (metricWidth +
        metricGap) *
        3,
    y,
    metricWidth,
    "Missing Skills",
    String(
      missingSkills.length
    ),
    "Skills recommended for improvement.",
    COLORS.red,
    COLORS.redLight
  );

  y += 49;

  /* ROLE */

  roundedCard(
    margin,
    y,
    contentWidth,
    34,
    COLORS.white,
    COLORS.border
  );

  setText(
    COLORS.muted
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    7.5
  );

  pdf.text(
    "TARGET ROLE",
    margin + 7,
    y + 10
  );

  setText(
    COLORS.navy
  );

  pdf.setFontSize(
    13
  );

  pdf.text(
    role,
    margin + 7,
    y + 20
  );

  setText(
    COLORS.muted
  );

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(
    7
  );

  pdf.text(
    "Analysis is based on the selected job title and evidence detected in the uploaded resume.",
    margin + 7,
    y + 27
  );

  resetText();

  y += 44;

  /* SCORE BAR */

  addSectionTitle(
    "Overall Alignment",
    "A quick view of your current resume readiness."
  );

  addProgressBar(
    "ATS Compatibility",
    score,
    score >= 70
      ? COLORS.green
      : score >= 40
        ? COLORS.yellow
        : COLORS.red
  );

  /* KEY MESSAGE */

  roundedCard(
    margin,
    y + 2,
    contentWidth,
    39,
    COLORS.blueLight,
    [191, 219, 254]
  );

  setText(
    COLORS.blue
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    9
  );

  pdf.text(
    "What to focus on next",
    margin + 7,
    y + 12
  );

  setText(
    COLORS.text
  );

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(
    8
  );

  const nextFocus =
    missingSkills.length >
    0
      ? `Prioritize ${missingSkills
          .slice(0, 3)
          .join(", ")} and add genuine evidence through projects or experience.`
      : "Strengthen measurable achievements, technical depth and role-specific evidence.";

  const focusLines =
    pdf.splitTextToSize(
      nextFocus,
      contentWidth - 14
    );

  pdf.text(
    focusLines,
    margin + 7,
    y + 20
  );

  addFooter(1);

  /* ==========================================================
     PAGE 2 — SKILLS
  ========================================================== */

  pdf.addPage();

  addPageBackground();

  addPageHeader(
    "Skill Analysis",
    2
  );

  addSectionTitle(
    "Detected Skills",
    "Skills and evidence identified from the uploaded resume."
  );

  if (
    exactMatches.length >
    0
  ) {
    setText(
      COLORS.green
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      10
    );

    pdf.text(
      `Direct Matches (${exactMatches.length})`,
      margin,
      y
    );

    y += 5;

    addTagGrid(
      exactMatches,
      COLORS.green,
      COLORS.greenLight
    );
  }

  if (
    relatedMatches.length >
    0
  ) {
    setText(
      COLORS.blue
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      10
    );

    pdf.text(
      `Related Matches (${relatedMatches.length})`,
      margin,
      y
    );

    y += 5;

    addTagGrid(
      relatedMatches,
      COLORS.blue,
      COLORS.blueLight
    );
  }

  if (
    contextualMatches.length >
    0
  ) {
    setText(
      COLORS.yellow
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      10
    );

    pdf.text(
      `Contextual Matches (${contextualMatches.length})`,
      margin,
      y
    );

    y += 5;

    addTagGrid(
      contextualMatches,
      COLORS.yellow,
      COLORS.yellowLight
    );
  }

  if (
    skills.length >
      0 &&
    exactMatches.length ===
      0 &&
    relatedMatches.length ===
      0 &&
    contextualMatches.length ===
      0
  ) {
    addTagGrid(
      skills,
      COLORS.blue,
      COLORS.blueLight
    );
  }

  y += 3;

  /* MISSING */

  addSectionTitle(
    "Missing Skills",
    "Skills that could improve your alignment with the selected role."
  );

  if (
    missingSkills.length >
    0
  ) {
    addTagGrid(
      missingSkills,
      COLORS.red,
      COLORS.redLight
    );
  } else {
    roundedCard(
      margin,
      y,
      contentWidth,
      25,
      COLORS.greenLight,
      [187, 247, 208]
    );

    setText(
      COLORS.green
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      9
    );

    pdf.text(
      "No missing skills detected.",
      margin + 7,
      y + 10
    );

    setText(
      COLORS.muted
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      7.5
    );

    pdf.text(
      "Continue strengthening the evidence for your existing skills.",
      margin + 7,
      y + 17
    );

    y += 32;
  }

  /* MATCH SUMMARY */

  addSectionTitle(
    "Match Summary"
  );

  const summaryWidth =
    (contentWidth - 8) /
    3;

  const summaryItems = [
    {
      title: "Direct",
      value:
        exactMatches.length,
      color:
        COLORS.green,
      light:
        COLORS.greenLight,
    },
    {
      title: "Related",
      value:
        relatedMatches.length,
      color:
        COLORS.blue,
      light:
        COLORS.blueLight,
    },
    {
      title: "Contextual",
      value:
        contextualMatches.length,
      color:
        COLORS.yellow,
      light:
        COLORS.yellowLight,
    },
  ];

  for (
    const [
      index,
      item,
    ] of summaryItems.entries()
  ) {
    const x =
      margin +
      index *
        (summaryWidth + 4);

    roundedCard(
      x,
      y,
      summaryWidth,
      32,
      COLORS.white,
      COLORS.border
    );

    setText(
      item.color
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      18
    );

    pdf.text(
      String(
        item.value
      ),
      x + 7,
      y + 14
    );

    setText(
      COLORS.text
    );

    pdf.setFontSize(
      8
    );

    pdf.text(
      `${item.title} matches`,
      x + 7,
      y + 23
    );

    resetText();
  }

  y += 41;

  /* LEGEND */

  roundedCard(
    margin,
    y,
    contentWidth,
    39,
    COLORS.white,
    COLORS.border
  );

  setText(
    COLORS.navy
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    9
  );

  pdf.text(
    "How to interpret your matches",
    margin + 7,
    y + 10
  );

  const legendItems = [
    {
      label:
        "Direct Match",
      text:
        "The exact skill is detected in your resume.",
      color:
        COLORS.green,
    },
    {
      label:
        "Related Match",
      text:
        "Your resume contains closely related evidence.",
      color:
        COLORS.blue,
    },
    {
      label:
        "Contextual",
      text:
        "There is supporting evidence, but the skill should be made clearer.",
      color:
        COLORS.yellow,
    },
  ];

  let legendY =
    y + 18;

  for (
    const item of legendItems
  ) {
    setFill(
      item.color
    );

    pdf.circle(
      margin + 9,
      legendY - 1.2,
      1.2,
      "F"
    );

    setText(
      COLORS.text
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      7.5
    );

    pdf.text(
      item.label,
      margin + 14,
      legendY
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    setText(
      COLORS.muted
    );

    pdf.text(
      item.text,
      margin + 43,
      legendY
    );

    legendY += 6;
  }

  resetText();

  addFooter(2);

  /* ==========================================================
     PAGE 3 — COVERAGE + RECOMMENDATIONS
  ========================================================== */

  pdf.addPage();

  addPageBackground();

  addPageHeader(
    "Role Alignment",
    3
  );

  addSectionTitle(
    "Skill Group Coverage",
    "Coverage across the major skill categories required for the selected role."
  );

  const groupEntries =
    Object.entries(
      skillGroups
    );

  if (
    groupEntries.length >
    0
  ) {
    for (
      const [
        groupName,
        groupSkillsValue,
      ] of groupEntries
    ) {
      const groupSkills =
        Array.isArray(
          groupSkillsValue
        )
          ? groupSkillsValue
          : [];

      const coverage =
        groupCoverage[
          groupName
        ] as CoverageItem |
          undefined;

      const percentage =
        clampScore(
          coverage?.percentage
        );

      const matched =
        normalizeArray(
          coverage?.matched_skills
        );

      const displayName =
        groupName
          .replace(
            /_/g,
            " "
          )
          .replace(
            /\b\w/g,
            (letter) =>
              letter.toUpperCase()
          );

      const barColor =
        percentage >= 70
          ? COLORS.green
          : percentage >= 40
            ? COLORS.yellow
            : COLORS.red;

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(
        8.5
      );

      setText(
        COLORS.text
      );

      pdf.text(
        displayName,
        margin,
        y
      );

      setText(
        barColor
      );

      pdf.text(
        `${Math.round(
          percentage
        )}%`,
        pageWidth -
          margin,
        y,
        {
          align:
            "right",
        }
      );

      y += 3.5;

      setFill(
        [226, 232, 240]
      );

      pdf.roundedRect(
        margin,
        y,
        contentWidth,
        4,
        2,
        2,
        "F"
      );

      if (
        percentage > 0
      ) {
        setFill(
          barColor
        );

        pdf.roundedRect(
          margin,
          y,
          (contentWidth *
            percentage) /
            100,
          4,
          2,
          2,
          "F"
        );
      }

      y += 7;

      setText(
        COLORS.muted
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        6.8
      );

      pdf.text(
        `${matched.length} of ${groupSkills.length} skills matched`,
        margin,
        y
      );

      y += 9;

      resetText();
    }
  } else {
    roundedCard(
      margin,
      y,
      contentWidth,
      30,
      COLORS.white,
      COLORS.border
    );

    setText(
      COLORS.muted
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      8
    );

    pdf.text(
      "Detailed skill-group coverage is not available for this analysis.",
      margin + 7,
      y + 15
    );

    y += 38;

    resetText();
  }

  /* RECOMMENDATIONS */

  addSectionTitle(
    "Prioritized Skill Improvements",
    "Focus on high-impact improvements before lower-priority additions."
  );

  if (
    recommendations.length >
    0
  ) {
    for (
      const recommendation of recommendations
    ) {
      const skill =
        safeText(
          recommendation?.skill
        ) || "Skill";

      const priority =
        safeText(
          recommendation?.priority
        ) || "medium";

      const group =
        safeText(
          recommendation?.group
        ).replace(
          /_/g,
          " "
        );

      const importance =
        safeText(
          recommendation?.importance
        );

      const action =
        safeText(
          recommendation?.action
        );

      const guidance =
        safeText(
          recommendation?.resume_guidance
        );

      const title =
        safeText(
          recommendation?.title
        );

      const priorityColors =
        getPriorityColor(
          priority
        );

      const cardHeight =
        guidance &&
        action
          ? 55
          : 43;

      roundedCard(
        margin,
        y,
        contentWidth,
        cardHeight,
        COLORS.white,
        COLORS.border
      );

      setFill(
        priorityColors.background
      );

      pdf.roundedRect(
        margin + 6,
        y + 6,
        24,
        7,
        2,
        2,
        "F"
      );

      setText(
        priorityColors.text
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(
        6.5
      );

      pdf.text(
        priority
          .toUpperCase(),
        margin + 18,
        y + 10.5,
        {
          align:
            "center",
        }
      );

      setText(
        COLORS.navy
      );

      pdf.setFontSize(
        10
      );

      pdf.text(
        skill,
        margin + 36,
        y + 11
      );

      setText(
        COLORS.muted
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        6.5
      );

      const meta =
        [group, importance]
          .filter(Boolean)
          .join("  |  ");

      if (meta) {
        pdf.text(
          meta,
          margin + 36,
          y + 17
        );
      }

      let bodyY =
        y + 26;

      if (title) {
        setText(
          COLORS.text
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          7
        );

        pdf.text(
          title,
          margin + 7,
          bodyY
        );

        bodyY += 5;
      }

      if (action) {
        setText(
          COLORS.text
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          7
        );

        const actionLines =
          pdf.splitTextToSize(
            action,
            contentWidth - 14
          );

        pdf.text(
          actionLines.slice(
            0,
            2
          ),
          margin + 7,
          bodyY
        );

        bodyY +=
          actionLines
            .slice(
              0,
              2
            ).length *
            3.5 +
          4;
      }

      if (guidance) {
        setText(
          COLORS.blue
        );

        pdf.setFont(
          "helvetica",
          "italic"
        );

        pdf.setFontSize(
          6.8
        );

        const guidanceLines =
          pdf.splitTextToSize(
            `Resume guidance: ${guidance}`,
            contentWidth - 14
          );

        pdf.text(
          guidanceLines.slice(
            0,
            2
          ),
          margin + 7,
          bodyY
        );
      }

      y +=
        cardHeight + 5;

      resetText();
    }
  } else {
    roundedCard(
      margin,
      y,
      contentWidth,
      30,
      COLORS.blueLight,
      [191, 219, 254]
    );

    setText(
      COLORS.blue
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      8
    );

    pdf.text(
      "No prioritized skill recommendations available.",
      margin + 7,
      y + 12
    );

    setText(
      COLORS.muted
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      7
    );

    pdf.text(
      "Review the missing skills above and strengthen them through genuine evidence.",
      margin + 7,
      y + 19
    );

    y += 38;

    resetText();
  }

  addFooter(3);

  /* ==========================================================
     PAGE 4 — AI FEEDBACK
  ========================================================== */

  pdf.addPage();

  addPageBackground();

  addPageHeader(
    "AI Resume Feedback",
    4
  );

  addSectionTitle(
    "AI Resume Feedback",
    "AI-generated observations intended to help improve the quality and impact of your resume."
  );

  const feedbackSections = [
    {
      title:
        "Strengths",
      items:
        strengths,
      color:
        COLORS.green,
      light:
        COLORS.greenLight,
    },
    {
      title:
        "Weaknesses",
      items:
        weaknesses,
      color:
        COLORS.yellow,
      light:
        COLORS.yellowLight,
    },
    {
      title:
        "Suggestions",
      items:
        suggestions,
      color:
        COLORS.blue,
      light:
        COLORS.blueLight,
    },
  ];

  for (
    const section of feedbackSections
  ) {
    if (
      section.items.length ===
      0
    ) {
      continue;
    }

    const estimatedHeight =
      Math.min(
        70,
        20 +
          section.items.length *
            9
      );

    roundedCard(
      margin,
      y,
      contentWidth,
      estimatedHeight,
      COLORS.white,
      COLORS.border
    );

    setFill(
      section.color
    );

    pdf.roundedRect(
      margin,
      y,
      3,
      estimatedHeight,
      1.5,
      1.5,
      "F"
    );

    setFill(
      section.light
    );

    pdf.circle(
      margin + 12,
      y + 12,
      5,
      "F"
    );

    setText(
      section.color
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      10
    );

    pdf.text(
      section.title,
      margin + 22,
      y + 14
    );

    let feedbackY =
      y + 23;

    for (
      const item of section.items
    ) {
      const lines =
        pdf.splitTextToSize(
          item,
          contentWidth - 32
        );

      setFill(
        section.color
      );

      pdf.circle(
        margin + 12,
        feedbackY - 1,
        0.8,
        "F"
      );

      setText(
        COLORS.text
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        7.5
      );

      pdf.text(
        lines.slice(
          0,
          3
        ),
        margin + 17,
        feedbackY
      );

      feedbackY +=
        Math.min(
          3,
          lines.length
        ) *
          3.7 +
        3;
    }

    y +=
      estimatedHeight +
      7;

    resetText();
  }

  if (
    strengths.length ===
      0 &&
    weaknesses.length ===
      0 &&
    suggestions.length ===
      0
  ) {
    roundedCard(
      margin,
      y,
      contentWidth,
      50,
      COLORS.blueLight,
      [191, 219, 254]
    );

    setText(
      COLORS.blue
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      10
    );

    pdf.text(
      "AI feedback is not available",
      margin + 8,
      y + 15
    );

    setText(
      COLORS.muted
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      8
    );

    const noFeedbackLines =
      pdf.splitTextToSize(
        "The resume scoring and skill analysis are still available. Use the missing skills and role coverage sections to guide your next improvements.",
        contentWidth - 16
      );

    pdf.text(
      noFeedbackLines,
      margin + 8,
      y + 23
    );

    y += 60;

    resetText();
  }

  /* FINAL ACTION PLAN */

  addSectionTitle(
    "Recommended Action Plan",
    "A practical sequence for improving the resume."
  );

  const actionPlan = [
    {
      number: "01",
      title:
        "Strengthen role-specific skills",
      text:
        missingSkills.length >
        0
          ? `Start with ${missingSkills
              .slice(0, 4)
              .join(", ")}.`
          : "Strengthen the evidence behind your existing technical skills.",
      color:
        COLORS.red,
        light:
        COLORS.redLight,
    },
    {
      number: "02",
      title:
        "Add measurable evidence",
      text:
        "Use concrete project outcomes, technical implementation details and measurable results.",
      color:
        COLORS.blue,
        light:
        COLORS.blueLight,
    },
    {
      number: "03",
      title:
        "Improve resume clarity",
      text:
        "Keep skills, projects, education and experience clearly structured for recruiters and ATS systems.",
      color:
        COLORS.purple,
        light:
        COLORS.purpleLight,
    },
  ];

  for (
    const action of actionPlan
  ) {
    roundedCard(
      margin,
      y,
      contentWidth,
      30,
      COLORS.white,
      COLORS.border
    );

    setFill(
      action.light
    );

    pdf.circle(
      margin + 12,
      y + 15,
      7,
      "F"
    );

    setText(
      action.color
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      7
    );

    pdf.text(
      action.number,
      margin + 12,
      y + 17,
      {
        align:
          "center",
      }
    );

    setText(
      COLORS.navy
    );

    pdf.setFontSize(
      9
    );

    pdf.text(
      action.title,
      margin + 24,
      y + 11
    );

    setText(
      COLORS.muted
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      7
    );

    const actionLines =
      pdf.splitTextToSize(
        action.text,
        contentWidth - 32
      );

    pdf.text(
      actionLines.slice(
        0,
        2
      ),
      margin + 24,
      y + 18
    );

    y += 36;

    resetText();
  }

  addFooter(4);

  /* ==========================================================
     SAVE PDF
  ========================================================== */

  const originalName =
    fileName
      .replace(
        /\.pdf$/i,
        ""
      )
      .replace(
        /[^a-zA-Z0-9-_]/g,
        "_"
      );

  pdf.save(
    `${originalName}_ResumeLens_Analysis.pdf`
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function ActionButtons({
  file,
  analysis,
}: Props) {
  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const handleDownloadPDF =
    async () => {
      if (downloading) {
        return;
      }

      try {
        setDownloading(
          true
        );

        toast.info(
          "Generating your PDF report..."
        );

        /*
         * Allow the UI to update before
         * the synchronous PDF generation.
         */
        await new Promise<void>(
          (resolve) => {
            window.setTimeout(
              resolve,
              50
            );
          }
        );

        generateAnalysisPDF(
          file,
          analysis
        );

        toast.success(
          "PDF report downloaded successfully"
        );
      } catch (error) {
        console.error(
          "PDF generation failed:",
          error
        );

        toast.error(
          "Failed to generate PDF",
          {
            description:
              "Please try again. If the problem continues, check the browser console.",
          }
        );
      } finally {
        /*
         * Always unlock the button,
         * even when PDF generation fails.
         */
        setDownloading(
          false
        );
      }
    };

  const handleUploadAnother =
    () => {
      window.location.reload();
    };

  return (
    <div
      className="
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:items-center
        sm:justify-center
      "
    >
      {/* ======================================================
          DOWNLOAD PDF
      ====================================================== */}

      <button
        type="button"
        disabled={downloading}
        onClick={handleDownloadPDF}
        className="
          ring-focus
          inline-flex
          h-11
          items-center
          justify-center
          gap-2.5
          rounded-xl
          bg-primary
          px-6
          text-sm
          font-medium
          text-primary-foreground
          shadow-sm
          transition-all
          duration-200
          hover:opacity-90
          hover:shadow-md
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <Download
          className="size-4"
          strokeWidth={1.8}
        />

        {downloading
          ? "Generating PDF..."
          : "Download PDF"}
      </button>

      {/* ======================================================
          UPLOAD ANOTHER
      ====================================================== */}

      <button
        type="button"
        onClick={handleUploadAnother}
        className="
          ring-focus
          inline-flex
          h-11
          items-center
          justify-center
          gap-2.5
          rounded-xl
          border
          border-border
          bg-card
          px-6
          text-sm
          font-medium
          text-foreground
          transition-all
          duration-200
          hover:bg-accent
          hover:border-border-strong
        "
      >
        <UploadCloud
          className="size-4"
          strokeWidth={1.8}
        />

        Upload Another Resume
      </button>
    </div>
  );
}