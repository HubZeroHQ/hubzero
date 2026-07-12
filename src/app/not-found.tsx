import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-caption text-text-muted font-mono tracking-widest uppercase">404</p>
      <h1 className="text-h2 text-text font-semibold">Page not found.</h1>
      <p className="text-body text-text-muted max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="border-border text-body text-text hover:border-accent hover:text-accent-text focus-visible:outline-accent mt-2 rounded-full border px-5 py-2 transition-colors focus-visible:outline-2"
      >
        Back home
      </Link>
    </main>
  );
}
