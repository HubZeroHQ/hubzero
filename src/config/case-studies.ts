/**
 * Case study summaries for the Work index (`/work`). One real entry today —
 * per `ARCHITECTURE/00_FOUNDER_APPROVAL.md` §2, one real case study is
 * sufficient to launch the premium positioning on. Structured so a second
 * entry is an array addition, not a template rewrite (`06_PAGE_SPECIFICATIONS.md`
 * "gracefully supports 1 case study or 100"). This is a static content list,
 * not the CMS-backed collection described in `09_CMS_ARCHITECTURE.md` — that
 * infrastructure is explicitly out of scope until CMS/Admin work begins.
 */
export type PracticeTag = "Software" | "Hardware" | "Both";

export interface CaseStudySummary {
  slug: string;
  client: string;
  title: string;
  /** One honest, specific line — never an invented business outcome. */
  result: string;
  tag: PracticeTag;
  cover: { src: string; alt: string; width: number; height: number };
}

export const caseStudies: CaseStudySummary[] = [
  {
    slug: "bhatkal-time-luxe",
    client: "Bhatkal Time Luxe",
    title: "A luxury watch storefront with a self-service back office",
    result: "Catalog, pricing, and homepage curation the client now runs without a developer.",
    tag: "Software",
    cover: {
      src: "/case-studies/bhatkal-time-luxe/hero-homepage.webp",
      alt: "Bhatkal Time Luxe homepage — dark editorial storefront with gold accent",
      width: 2557,
      height: 1270,
    },
  },
];

export const practiceTags: { label: string; value: PracticeTag | "All" }[] = [
  { label: "All work", value: "All" },
  { label: "Software Engineering", value: "Software" },
  { label: "Hardware & Embedded", value: "Hardware" },
];
