import type { Metadata } from 'next';
import { LoginForm } from '@/components/cms/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in — HubZero CMS',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="bg-bg-base flex min-h-screen items-center justify-center px-4">
      <div className="rounded-card border-border-default bg-surface-default w-full max-w-[380px] border p-8">
        <p className="text-text-muted mb-1 font-mono text-xs tracking-[0.1em] uppercase">
          HubZero CMS
        </p>
        <h1 className="text-text-primary mb-6 text-lg font-semibold">Sign in</h1>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
