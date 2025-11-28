import type { Metadata } from "next";
import { getAllPostsMeta, type BlogPostMeta } from "@/lib/blog";
import BlogIndex from "@/components/blog/BlogIndex";

export const metadata: Metadata = {
  title: "Blog | HubZero",
  description: "Insights, case studies, and guides from the HubZero team.",
};

export default async function BlogPage() {
  const posts: BlogPostMeta[] = getAllPostsMeta();
  return <BlogIndex posts={posts} />;
}
