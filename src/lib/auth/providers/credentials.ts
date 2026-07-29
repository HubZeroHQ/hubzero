import Credentials from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/auth/password';
import { userRepository } from '@/lib/db/repositories/user';

/**
 * The only sign-in method — Studio access only, no public visitor accounts and
 * no external identity provider dependency for a five-person team
 * (PLANNING.md §37, §26.9). Auth.js requires JWT sessions whenever a
 * Credentials provider is present (see lib/auth/index.ts for why).
 */
export const credentialsProvider = Credentials({
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    const email = typeof credentials?.email === 'string' ? credentials.email : undefined;
    const password = typeof credentials?.password === 'string' ? credentials.password : undefined;
    if (!email || !password) {
      return null;
    }

    // `userRepository.findByEmail` normalizes (trim + lowercase) before the
    // exact-match query, matching how every write path stores the email —
    // so a correct password doesn't fail to sign in over casing/padding.
    const user = await userRepository.findByEmail(email);
    if (!user?.passwordHash) {
      return null;
    }

    // A disabled account can never authenticate, regardless of whether the
    // password is still correct — Users management's disable/enable toggle
    // (Users completion sprint, Part 1) has to actually block sign-in, not
    // just hide the account from the admin list.
    if (user.disabled) {
      return null;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };
  },
});
