'use server';

import { AuthError, CredentialsSignin } from 'next-auth';
import { signIn, signOut } from '@/lib/auth';

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/studio/login' });
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
      redirectTo:
        typeof callbackUrl === 'string' && callbackUrl ? callbackUrl : '/studio/dashboard',
    });
    return {};
  } catch (error) {
    // Next.js's redirect() (thrown by a successful signIn) surfaces as a
    // special error that must be rethrown, never treated as a failure.
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }

    // `authorize()` returning `null` (wrong email, wrong password, disabled
    // account) is the one case Auth.js reports as `CredentialsSignin` — a
    // genuine, expected credential failure. Anything else reaching here
    // (a thrown error, e.g. MongoDB being unreachable) is an infrastructure
    // failure the user did nothing to cause, and telling them their
    // password is wrong would be actively misleading. The full error is
    // still logged server-side so it's not silently lost.
    if (error instanceof CredentialsSignin) {
      return { error: 'Incorrect email or password.' };
    }
    console.error('loginAction: sign-in failed unexpectedly', error);
    if (error instanceof AuthError) {
      return { error: 'Unable to sign in at the moment. Please try again later.' };
    }
    return { error: 'Something went wrong. Try again.' };
  }
}
