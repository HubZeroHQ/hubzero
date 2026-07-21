'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { auth, signOut } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { requireCapability } from '@/lib/auth/permissions';
import { userRepository } from '@/lib/db/repositories/user';
import { isLastActiveHeadAdmin } from '@/lib/studio/safeguards/users';
import { zodErrorToFieldErrors } from '@/lib/validation/form-errors';
import { userSchema } from '@/lib/validation/user';
import type { EntryActionState } from '@/lib/studio/entry-actions';

const LIST_PATH = '/studio/settings/users';
const detailPath = (id: string) => `${LIST_PATH}/${id}`;

function actionErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

function readRole(formData: FormData) {
  const value = String(formData.get('role') ?? '');
  return value === 'headAdmin' || value === 'admin' || value === 'member' ? value : undefined;
}

/**
 * Users management is Head-Admin-only end to end (`manageUsers` is
 * `headAdmin`-only in `config/permissions.ts`) — that single capability
 * check is also what structurally prevents privilege escalation: no role
 * other than Head Admin can ever reach any action in this file, so a
 * Member or Admin has no path to grant themselves a higher role.
 */
export async function createUserAction(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('manageUsers');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const password = String(formData.get('password') ?? '');
  if (password.length < 12) {
    return {
      error: 'Check the highlighted fields.',
      fieldErrors: { password: 'Password must be at least 12 characters.' },
    };
  }

  let created;
  try {
    created = await userRepository.create(
      userSchema.parse({
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? '')
          .trim()
          .toLowerCase(),
        role: readRole(formData) ?? 'member',
        passwordHash: await hashPassword(password),
        disabled: false,
        // The admin who creates this account chooses the initial password,
        // not the account's owner — flagged so the new user is prompted to
        // set their own on first sign-in, the same as a password reset.
        mustChangePassword: true,
      }),
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'Check the highlighted fields.', fieldErrors: zodErrorToFieldErrors(error) };
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return {
        error: 'Check the highlighted fields.',
        fieldErrors: { email: 'A user with this email already exists.' },
      };
    }
    return { error: actionErrorMessage(error) };
  }

  revalidatePath(LIST_PATH);
  redirect(detailPath(created._id.toString()));
}

/** Name/email/role — never `disabled`/password here, those have their own dedicated actions with their own confirmation UX. */
export async function updateUserAction(
  id: string,
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('manageUsers');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const existing = await userRepository.findById(id);
  if (!existing) {
    return { error: 'This user no longer exists.' };
  }

  const nextRole = readRole(formData);
  if (existing.role === 'headAdmin' && nextRole && nextRole !== 'headAdmin') {
    if (await isLastActiveHeadAdmin(id)) {
      return {
        error:
          'This is the last active Head Admin. Promote another user to Head Admin before changing this role.',
      };
    }
  }

  try {
    await userRepository.update(id, {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? '')
        .trim()
        .toLowerCase(),
      role: nextRole ?? existing.role,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'Check the highlighted fields.', fieldErrors: zodErrorToFieldErrors(error) };
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return {
        error: 'Check the highlighted fields.',
        fieldErrors: { email: 'A user with this email already exists.' },
      };
    }
    return { error: actionErrorMessage(error) };
  }

  revalidatePath(detailPath(id));
  redirect(detailPath(id));
}

export async function setUserDisabledAction(
  id: string,
  disabled: boolean,
): Promise<EntryActionState> {
  try {
    await requireCapability('manageUsers');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  if (disabled && (await isLastActiveHeadAdmin(id))) {
    return {
      error:
        'This is the last active Head Admin. Promote another user to Head Admin before disabling this account.',
    };
  }

  await userRepository.update(id, { disabled });
  revalidatePath(detailPath(id));
  revalidatePath(LIST_PATH);
  return {};
}

export async function deleteUserAction(id: string): Promise<EntryActionState> {
  try {
    await requireCapability('manageUsers');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  if (await isLastActiveHeadAdmin(id)) {
    return {
      error:
        'This is the last active Head Admin. Promote another user to Head Admin before deleting this account.',
    };
  }

  await userRepository.remove(id);
  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

/** Head Admin sets a new password on the user's behalf — there's no email infrastructure in this app for a reset-link flow. */
export async function resetUserPasswordAction(
  id: string,
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('manageUsers');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const existing = await userRepository.findById(id);
  if (!existing) {
    return { error: 'This user no longer exists.' };
  }

  const newPassword = String(formData.get('newPassword') ?? '');
  if (newPassword.length < 12) {
    return {
      error: 'Check the highlighted fields.',
      fieldErrors: { newPassword: 'Password must be at least 12 characters.' },
    };
  }

  await userRepository.update(id, {
    passwordHash: await hashPassword(newPassword),
    mustChangePassword: true,
  });

  revalidatePath(detailPath(id));
  return {};
}

/** Every authenticated role may edit their own display name — role/disabled state stay Users-management-only, so a session can never grant itself more access from here. */
export async function updateOwnProfileAction(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const session = await auth();
  if (!session) {
    return { error: 'You must be signed in to do this.' };
  }

  const name = String(formData.get('name') ?? '').trim();
  if (!name) {
    return { error: 'Check the highlighted fields.', fieldErrors: { name: 'Name is required.' } };
  }

  await userRepository.update(session.user.id, { name });
  revalidatePath('/studio/profile');
  return {};
}

export async function changeOwnPasswordAction(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const session = await auth();
  if (!session) {
    return { error: 'You must be signed in to do this.' };
  }

  const currentPassword = String(formData.get('currentPassword') ?? '');
  const newPassword = String(formData.get('newPassword') ?? '');

  const user = await userRepository.findById(session.user.id);
  if (!user?.passwordHash) {
    return { error: 'Something went wrong. Try again.' };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return {
      error: 'Check the highlighted fields.',
      fieldErrors: { currentPassword: 'Current password is incorrect.' },
    };
  }

  if (newPassword.length < 12) {
    return {
      error: 'Check the highlighted fields.',
      fieldErrors: { newPassword: 'Password must be at least 12 characters.' },
    };
  }

  await userRepository.update(session.user.id, {
    passwordHash: await hashPassword(newPassword),
    mustChangePassword: false,
  });

  // `mustChangePassword` lives on the JWT (`auth-jwt.ts`) and is only ever
  // refreshed at sign-in, the same as `role` — so clearing it in the
  // database alone wouldn't stop `middleware.ts` from redirecting this
  // still-active session back here. Signing out forces a fresh JWT (with
  // the new password) on next sign-in rather than adding a session-update
  // trigger just for this one field. `signOut` with `redirectTo` throws
  // Next.js's internal redirect signal, so the `return` below only
  // satisfies the declared return type — it's never actually reached.
  await signOut({ redirectTo: '/studio/login' });
  return {};
}
