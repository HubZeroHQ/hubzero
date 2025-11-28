import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkParse)              // Parse markdown
    .use(remarkFrontmatter, ["yaml"]) // Extract frontmatter
    .use(remarkGfm)                // Github markdown: tables, lists, strikethrough, etc.
    .use(remarkRehype, { allowDangerousHtml: true }) // Convert MD → HTML
    .use(rehypeRaw)                // Render raw HTML inside markdown
    .use(rehypeHighlight)          // Syntax highlighting for code blocks
    .use(rehypeStringify)          // HTML → string
    .process(markdown);

  return result.toString();
}
