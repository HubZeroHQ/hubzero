import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllPostsMeta,
  getPostBySlug,
  type BlogPost,
  type BlogPostMeta,
} from "@/lib/blog";
import BlogPostLayout from "@/components/blog/BlogPostLayout";

interface BlogPostPageParams {
  slug: string;
}

interface BlogPostPageProps {
  params: Promise<BlogPostPageParams>; // Next 15 quirk
}

export async function generateStaticParams(): Promise<BlogPostPageParams[]> {
  const posts: BlogPostMeta[] = getAllPostsMeta();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  { params }: BlogPostPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found | HubZero Blog" };
  }

  return {
    title: `${post.title} | HubZero Blog`,
    description: post.summary || undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post: BlogPost | null = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPostsMeta();
  const morePosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return <BlogPostLayout post={post} morePosts={morePosts} />;
}
