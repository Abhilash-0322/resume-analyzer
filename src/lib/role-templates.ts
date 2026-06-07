import type { RoleId, RoleTemplate } from "@/types/analysis";

export const ROLE_TEMPLATES: Record<RoleId, RoleTemplate> = {
  "software-engineer": {
    id: "software-engineer",
    name: "Software Engineer",
    description:
      "Benchmarks for SWE roles — emphasizes technical skills, system design, and quantified engineering impact.",
    icon: "Code2",
    benchmarks: {
      overall: 78,
      atsCompatibility: 82,
      contentQuality: 75,
      formatting: 80,
      keywordOptimization: 80,
      impactStatements: 78,
    },
    expectedKeywords: [
      "JavaScript",
      "TypeScript",
      "Python",
      "React",
      "Node.js",
      "API",
      "Git",
      "AWS",
      "microservices",
      "CI/CD",
      "SQL",
      "agile",
      "system design",
      "REST",
    ],
    expectedSkills: {
      technical: [
        "JavaScript/TypeScript",
        "Python",
        "React/Next.js",
        "Node.js",
        "SQL",
        "Git",
        "AWS/Cloud",
        "System Design",
        "APIs",
        "Testing",
      ],
      soft: ["Problem Solving", "Collaboration", "Code Review", "Mentoring", "Agile"],
    },
    dimensionLabels: {
      atsCompatibility: "ATS parseability & standard tech headings",
      contentQuality: "Technical depth & project clarity",
      formatting: "Clean single-column, scannable layout",
      keywordOptimization: "Stack keywords & frameworks density",
      impactStatements: "Quantified engineering outcomes",
    },
    tips: [
      "Lead bullets with strong verbs: Architected, Optimized, Deployed, Refactored.",
      "Quantify scale: requests/sec, latency reduction, users served, deployment frequency.",
      "List a dedicated Skills section with languages, frameworks, and cloud tools.",
      "Include 1–2 notable projects or open-source contributions with tech stack.",
      "Mirror JD keywords for your target stack (e.g. Kubernetes, GraphQL, Terraform).",
    ],
  },
  "product-manager": {
    id: "product-manager",
    name: "Product Manager",
    description:
      "Benchmarks for PM roles — prioritizes outcomes, cross-functional leadership, and product metrics.",
    icon: "LayoutGrid",
    benchmarks: {
      overall: 76,
      atsCompatibility: 78,
      contentQuality: 82,
      formatting: 78,
      keywordOptimization: 72,
      impactStatements: 85,
    },
    expectedKeywords: [
      "roadmap",
      "stakeholder",
      "KPI",
      "user research",
      "A/B testing",
      "PRD",
      "cross-functional",
      "product launch",
      "metrics",
      "prioritization",
      "agile",
      "OKRs",
      "customer",
      "strategy",
    ],
    expectedSkills: {
      technical: ["SQL", "Analytics", "A/B Testing", "Figma", "Jira", "Data Analysis"],
      soft: [
        "Stakeholder Management",
        "Leadership",
        "Communication",
        "Prioritization",
        "User Empathy",
        "Strategic Thinking",
      ],
    },
    dimensionLabels: {
      atsCompatibility: "Clear product-focused section structure",
      contentQuality: "Narrative clarity & business context",
      formatting: "Concise, outcome-first bullet layout",
      keywordOptimization: "Product & growth terminology",
      impactStatements: "Revenue, retention, and launch metrics",
    },
    tips: [
      "Frame bullets as: Problem → Action → Measurable business outcome.",
      "Highlight launches with adoption, revenue, or retention impact.",
      "Show cross-functional work with engineering, design, and sales.",
      "Include product artifacts: PRDs, roadmaps, user research, OKRs.",
      "Use metrics: DAU, conversion rate, NPS, time-to-market, churn reduction.",
    ],
  },
  "data-analyst": {
    id: "data-analyst",
    name: "Data Analyst",
    description:
      "Benchmarks for analyst roles — stresses SQL, visualization, statistical rigor, and data storytelling.",
    icon: "BarChart3",
    benchmarks: {
      overall: 75,
      atsCompatibility: 80,
      contentQuality: 74,
      formatting: 78,
      keywordOptimization: 85,
      impactStatements: 72,
    },
    expectedKeywords: [
      "SQL",
      "Python",
      "Excel",
      "Tableau",
      "Power BI",
      "ETL",
      "dashboard",
      "statistics",
      "regression",
      "A/B test",
      "data visualization",
      "pandas",
      "reporting",
      "KPI",
    ],
    expectedSkills: {
      technical: [
        "SQL",
        "Python/R",
        "Excel",
        "Tableau/Power BI",
        "Statistics",
        "ETL",
        "Data Modeling",
        "Pandas",
      ],
      soft: [
        "Data Storytelling",
        "Attention to Detail",
        "Business Acumen",
        "Communication",
        "Problem Solving",
      ],
    },
    dimensionLabels: {
      atsCompatibility: "Tool & method keywords ATS can parse",
      contentQuality: "Analytical rigor & insight quality",
      formatting: "Structured projects & methods sections",
      keywordOptimization: "BI tools & statistical terms density",
      impactStatements: "Decisions influenced by data",
    },
    tips: [
      "Name specific tools: SQL dialects, Tableau, Power BI, Python libraries.",
      "Show analyses that drove decisions — not just reports built.",
      "Quantify: dashboards used by X teams, $ saved, accuracy improved by Y%.",
      "Include statistical methods where relevant: regression, hypothesis testing.",
      "Add a Projects section with datasets, methods, and business outcomes.",
    ],
  },
};

export const ROLE_LIST = Object.values(ROLE_TEMPLATES);

export function getRoleTemplate(roleId: RoleId): RoleTemplate {
  return ROLE_TEMPLATES[roleId];
}

export function isValidRoleId(value: string): value is RoleId {
  return value in ROLE_TEMPLATES;
}
