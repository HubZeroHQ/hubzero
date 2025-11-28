// src/lib/blog/markdown-utils.ts
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

export interface ParsedFrontmatter {
  title: string;
  summary: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  readingTimeMinutes: number;
}

export interface FrontmatterParseResult {
  meta: ParsedFrontmatter;
  body: string;
  issues: string[]; // empty = fully valid
}

/**
 * Strict frontmatter parser:
 * - requires: title, summary, author, date, category, tags, readingTimeMinutes
 * - records ALL violations in `issues`
 * - still returns sane defaults so preview can render
 */
export function parseFrontmatterStrict(markdown: string): FrontmatterParseResult {
  const file = matter(markdown);
  const data = file.data as Record<string, unknown>;
  const content = file.content ?? "";
  const issues: string[] = [];

  if (Object.keys(data).length === 0) {
    issues.push("Frontmatter block is missing. Keep the --- metadata block at the top.");
  }

  // title
  const rawTitle = data.title;
  let title = "";
  if (typeof rawTitle === "string" && rawTitle.trim()) {
    title = rawTitle.trim();
  } else {
    issues.push('Missing or invalid "title".');
    title = "Your Post Title";
  }

  // summary
  const rawSummary = data.summary;
  let summary = "";
  if (typeof rawSummary === "string" && rawSummary.trim()) {
    summary = rawSummary.trim();
  } else {
    issues.push('Missing or invalid "summary".');
    summary = "Short 1–2 line description of the post.";
  }

  // author
  const rawAuthor = data.author;
  let author = "";
  if (typeof rawAuthor === "string" && rawAuthor.trim()) {
    author = rawAuthor.trim();
  } else {
    issues.push('Missing or invalid "author".');
    author = "HubZero Team";
  }

  // date
  const rawDate = data.date;
  let date = "";
  if (typeof rawDate === "string" && rawDate.trim()) {
    date = rawDate.trim();
  } else {
    issues.push('Missing or invalid "date". Use \"YYYY-MM-DD\".');
    date = new Date().toISOString().slice(0, 10);
  }

  // category
  const rawCategory = data.category;
  let category = "";
  if (typeof rawCategory === "string" && rawCategory.trim()) {
    category = rawCategory.trim();
  } else {
    issues.push('Missing or invalid "category".');
    category = "Design";
  }

  // tags
  const rawTags = data.tags;
  let tags: string[] = [];
  if (Array.isArray(rawTags) && rawTags.every((t) => typeof t === "string")) {
    tags = rawTags as string[];
  } else {
    issues.push('Missing or invalid "tags". It must be an array of strings.');
    tags = ["ui", "ux", "branding"];
  }

  // readingTimeMinutes
  const rawRtm = data.readingTimeMinutes;
  let readingTimeMinutes = 0;
  if (typeof rawRtm === "number" && Number.isFinite(rawRtm) && rawRtm > 0) {
    readingTimeMinutes = Math.round(rawRtm);
  } else {
    issues.push('Missing or invalid "readingTimeMinutes". It must be a number.');
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const approx = Math.max(1, Math.round(wordCount / 200));
    readingTimeMinutes = approx;
  }

  return {
    meta: {
      title,
      summary,
      author,
      date,
      category,
      tags,
      readingTimeMinutes,
    },
    body: content.trimStart(),
    issues,
  };
}

/**
 * Full markdown → HTML pipeline.
 * This is what fixes your headings / lists / code blocks.
 */
export async function markdownBodyToHtml(markdownBody: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(markdownBody);

  return String(file);
}
