import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container, Heading, Surface, Text } from "@/components/ui";
import { StudioLoginForm } from "@/app/studio/login/studio-login-form";
import { getSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "Sign in — HubZero Studio",
  robots: { index: false, follow: false },
};

interface StudioLoginPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function StudioLoginPage({ searchParams }: StudioLoginPageProps) {
  const { from } = await searchParams;

  // "Already signed in, skip the login page" lives here, not in
  // `proxy.ts` — this calls the same revocation-aware `getSessionUser()`
  // the protected layout uses, so a revoked session (still a "valid" JWT
  // to the edge-only middleware check) doesn't get bounced right back here
  // in a loop. See `proxy.ts`'s comment for the incident this fixed.
  const existingUser = await getSessionUser();
  if (existingUser) {
    redirect(from && from.startsWith("/studio") ? from : "/studio");
  }

  return (
    <main className="bg-bg flex min-h-dvh items-center justify-center">
      <Container size="prose" className="w-full max-w-md">
        <Surface padding="lg" shadow="sm" className="w-full">
          <Heading level={1} size="h3" className="mb-1">
            HubZero Studio
          </Heading>
          <Text tone="muted" className="mb-6">
            Sign in to manage HubZero&apos;s site content.
          </Text>
          <StudioLoginForm from={from} />
        </Surface>
      </Container>
    </main>
  );
}
