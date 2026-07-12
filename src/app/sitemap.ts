import type { MetadataRoute } from "next";

import "@/lib/cms/collections";

import { siteConfig } from "@/config/site";
import { findPublished } from "@/lib/cms/public-content";
import { Blueprint, type BlueprintDocument } from "@/models/blueprint";
import { CaseStudy, type CaseStudyDocument } from "@/models/case-study";
import { LabsProject, type LabsProjectDocument } from "@/models/labs-project";
import { Note, type NoteDocument } from "@/models/note";
import { TeamMember, type TeamMemberDocument } from "@/models/team-member";

const staticRoutes = [
  "/",
  "/services",
  "/services/software",
  "/services/hardware",
  "/work",
  "/blueprints",
  "/labs",
  "/team",
  "/notes",
  "/about",
  "/contact",
  "/careers",
  "/privacy",
  "/terms",
];

function lastModifiedOf(doc: {
  updatedAt?: string | Date | null;
  publishedAt?: string | Date | null;
}): Date {
  return new Date(doc.updatedAt ?? doc.publishedAt ?? Date.now());
}

/**
 * `/studio` is never listed here (`ARCHITECTURE/13_SEO_STRATEGY.md` §3) —
 * this file simply never references it, the same "content-gate, don't
 * hand-maintain a second list" discipline `PROJECT_CONTEXT.md` §12 applies
 * elsewhere. Entries for authored collections are generated from the
 * database (published items only), never a static file list, since content
 * lives in MongoDB, not the filesystem.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [caseStudies, notes, blueprints, labsProjects, teamMembers] = await Promise.all([
    findPublished<CaseStudyDocument>(CaseStudy),
    findPublished<NoteDocument>(Note),
    findPublished<BlueprintDocument>(Blueprint),
    findPublished<LabsProjectDocument>(LabsProject),
    findPublished<TeamMemberDocument>(TeamMember, { profileVisible: true }),
  ]);

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteConfig.url}${path}`,
  }));

  for (const doc of caseStudies) {
    entries.push({ url: `${siteConfig.url}/work/${doc.slug}`, lastModified: lastModifiedOf(doc) });
  }
  for (const doc of notes) {
    entries.push({ url: `${siteConfig.url}/notes/${doc.slug}`, lastModified: lastModifiedOf(doc) });
  }
  for (const doc of blueprints) {
    entries.push({
      url: `${siteConfig.url}/blueprints/${doc.slug}`,
      lastModified: lastModifiedOf(doc),
    });
  }
  for (const doc of labsProjects) {
    entries.push({ url: `${siteConfig.url}/labs/${doc.slug}`, lastModified: lastModifiedOf(doc) });
  }
  for (const doc of teamMembers) {
    entries.push({
      url: `${siteConfig.url}/team/${doc.username}`,
      lastModified: lastModifiedOf(doc),
    });
  }

  return entries;
}
