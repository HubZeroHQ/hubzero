'use server';

import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/lib/auth';

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/cms/login' });
}

export interface LoginActionState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = formData.get('email');
  const password = formData.get('password');
  const callbackUrl = formData.get('callbackUrl');

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: typeof callbackUrl === 'string' && callbackUrl ? callbackUrl : '/cms/dashboard',
    });
    return {};
  } catch (error) {
    // Next.js's redirect() (thrown by a successful signIn) surfaces as a
    // special error that must be rethrown, never treated as a failure.
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    if (error instanceof AuthError) {
      return { error: 'Incorrect email or password.' };
    }
    return { error: 'Something went wrong. Try again.' };
  }
}
