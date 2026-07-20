import type { DocumentRole, OwnerType } from '@/lib/documents/schema';

/**
 * Collection-and-role-specific editorial guidance (PLANNING.md §10–§14) —
 * layered on top of `MASTER_PROMPT`, never replacing it. Work, Builds,
 * Blueprints, Labs, and Notes exist to do different jobs; a case study
 * proving a client outcome and a Lab journal capturing in-progress research
 * should not read like the same document with different nouns swapped in.
 *
 * Keyed by `${ownerType}:${role}` so a single owner with multiple Documents
 * (a Build's `caseStudy` vs. its `technical` doc) gets genuinely distinct
 * guidance rather than one generic "Build" paragraph.
 */
export interface CollectionGuidance {
  label: string;
  goal: string;
  structure: string;
  voice: string;
}

const WORK_CASE_STUDY: CollectionGuidance = {
  label: 'Work — Case Study',
  goal: 'Read like an engineering retrospective the lead engineer wrote right after the project shipped — not a capability pitch, not a feature list, and not a generic "we built a website with X and Y" summary. A reader should finish understanding what problem existed, how the system\'s architecture evolved to address it, which alternatives were considered and rejected at each real decision point, what it actually costs to operate and maintain, and what a future engineer should reuse or avoid next time. A feature is never worth mentioning on its own — every time one comes up, explain why it exists, why it was built that way specifically, what the realistic alternative was, and what tradeoff was accepted. "Cloudinary stores images" is the failure mode; "we separated storage from delivery so the CDN could be swapped via configuration without touching application code" is the target. There is no separate technical document for Work entries (unlike Build), so this is the one place the real engineering depth has to live — do not leave it out in favor of a smoother narrative.',
  structure:
    'Prefer, to the extent the supplied material actually supports it: Project Background, the Problem, Architectural Evolution (how the system changed shape over the course of the build, not only its final state), Major Engineering Decisions (each with the alternative considered and the tradeoff accepted, not just the choice made), System Architecture, Operational Tooling (deployment, hosting, how updates actually ship, who is on the hook when something breaks), Engineering Challenges (a challenges section with nothing real in it is a sign real difficulties are being hidden, not that none existed), Performance & Security where real detail exists — concrete facts (caching, image handling, SEO, security posture) belong here even when the source states them plainly rather than as a decision with a rejected alternative; do not let the tradeoff-first emphasis elsewhere in this document crowd out real technical detail just because it was not framed as a choice between options, Lessons Learned, Reusable Patterns another project could adopt, and Outcomes. Do not stop after two or three sections just because that feels like a complete document — if the source material contains more decisions, constraints, or tradeoffs, draw all of them out before concluding. It is fine to skip a section outright when the source genuinely has nothing for it; padding a missing section with generic filler is worse than omitting it.',
  voice:
    'Written in the voice of the team that shipped it, in the first person plural — "we chose," "the project evolved," "the primary tradeoff was," "this became necessary because," "in retrospect" — never third-person marketing language describing HubZero from the outside. Confident but evidence-led: every claim about the architecture or the outcome should be something the supplied material actually substantiates, not an assertion of competence for its own sake.',
};

const BUILD_CASE_STUDY: CollectionGuidance = {
  label: 'Build — Case Study',
  goal: 'Tell the product story: why this Build exists, the philosophy behind it, and the outcome so far. This is the narrative half of a two-Document entry — architecture and technical decisions belong in the Technical document instead.',
  structure:
    'Open with the problem the Build addresses and why HubZero chose to build it rather than adopt something existing. Cover the product philosophy and what makes the approach distinct. Close with current state and what real usage has shown.',
  voice:
    'Product-narrative, still evidence-first — describe what was actually built and shipped, not an aspirational roadmap.',
};

const BUILD_TECHNICAL: CollectionGuidance = {
  label: 'Build — Technical Documentation',
  goal: 'Document the actual architecture, technical decisions, and challenges — the document an engineer joining the project would want to read first.',
  structure:
    'Lead with the architecture as it actually stands, not as originally planned. Name real technical decisions and the alternatives considered for each. Dedicate space to genuine challenges and how they were resolved — a challenges section with nothing in it is a sign real difficulties are being hidden, not that none existed.',
  voice:
    'Precise and implementation-focused — this is the one place deep technical detail (code, architecture diagrams described in prose, specific technology choices) is fully appropriate.',
};

const BLUEPRINT_CASE_STUDY: CollectionGuidance = {
  label: 'Blueprint — Case Study',
  goal: 'Let a reader understand a reusable foundation well enough to decide if it fits their own project — audience, architecture, design philosophy, and where it has already proven itself.',
  structure:
    'Open with the kind of project this Blueprint is built for and the problem its architecture/design-language pairing solves. Cover the technical foundation and design philosophy concretely. Close with where it has been used or what makes it ready to use now.',
  voice: 'Direct and practical — a Blueprint reader is evaluating a tool, not being sold a story.',
};

const LAB_JOURNAL_BASE: CollectionGuidance = {
  label: 'Lab — Engineering Journal',
  goal: 'Capture genuine in-progress research and engineering exploration as it happens — not a polished case study. A Lab entry is allowed to be uncertain, incomplete, and honest about blockers.',
  structure:
    "Write as an accumulating engineering notebook entry: what was tried, what was learned, what is still unresolved. Findings and blockers are first-class content, not something to smooth over. Do not manufacture a tidy narrative arc a still-active exploration doesn't actually have yet.",
  voice:
    'Genuine engineer-to-engineer voice — closer to a lab notebook or a detailed PR description than a marketing case study. Uncertainty ("we don\'t yet know whether X will hold up") is appropriate and should be stated plainly, not hedged around.',
};

const NOTE_BODY: CollectionGuidance = {
  label: 'Notes — Engineering Journal Entry',
  goal: 'Write a genuine engineering journal entry — the kind of piece that teaches a specific, real lesson or documents a specific decision, written in the voice of the engineer who lived it.',
  structure:
    'Open with the concrete situation or question, not an abstract topic sentence. Develop the technical reasoning with real specifics. Close with the actual takeaway — what would change next time, or what remains an open question.',
  voice:
    'The most personal, first-person-adjacent voice in the system — closest to the engineering-blog patterns (Stripe/Cloudflare/Fowler-style) this system is modeled on. Still never marketing language.',
};

const TEAM_PROFILE: CollectionGuidance = {
  label: 'Team — Engineering Profile',
  goal: "Describe an individual engineer's focus, expertise, and current work honestly — a professional profile, not a bio written to impress.",
  structure:
    'State current focus and real areas of expertise plainly. Reference specific, real work when it is supplied in context. Never invent achievements, titles, or specifics not present in the given context.',
  voice:
    'Plain and professional, first-person or third-person depending on the supplied context — never promotional.',
};

const DEFAULT_GUIDANCE: CollectionGuidance = {
  label: 'General Studio Content',
  goal: 'Produce clear, accurate, engineering-first content appropriate to the supplied context.',
  structure:
    "Follow the master prompt's structural guidance: concrete before abstract, short paragraphs, an honest close.",
  voice: "Direct, confident, unembellished — HubZero's standard voice.",
};

const COLLECTION_GUIDANCE: Partial<Record<`${OwnerType}:${DocumentRole}`, CollectionGuidance>> = {
  'Work:caseStudy': WORK_CASE_STUDY,
  'Build:caseStudy': BUILD_CASE_STUDY,
  'Build:technical': BUILD_TECHNICAL,
  'Blueprint:caseStudy': BLUEPRINT_CASE_STUDY,
  'Lab:journal': LAB_JOURNAL_BASE,
  'Lab:overview': { ...LAB_JOURNAL_BASE, label: 'Lab — Overview' },
  'Lab:engineeringJournal': LAB_JOURNAL_BASE,
  'Lab:findings': {
    ...LAB_JOURNAL_BASE,
    label: 'Lab — Findings',
    goal: 'Record what the research actually found — results, data, and their honest interpretation.',
  },
  'Lab:researchNotes': {
    ...LAB_JOURNAL_BASE,
    label: 'Lab — Research Notes',
    goal: 'Capture working research notes — approaches tried, references consulted, open threads.',
  },
  'Note:body': NOTE_BODY,
  'Team:profile': TEAM_PROFILE,
};

export function getCollectionGuidance(
  ownerType: OwnerType,
  role: DocumentRole,
): CollectionGuidance {
  return COLLECTION_GUIDANCE[`${ownerType}:${role}`] ?? DEFAULT_GUIDANCE;
}

export function renderCollectionGuidance(ownerType: OwnerType, role: DocumentRole): string {
  const guidance = getCollectionGuidance(ownerType, role);
  return `## Writing for: ${guidance.label}
Goal: ${guidance.goal}
Structure: ${guidance.structure}
Voice: ${guidance.voice}`;
}
