import { compare } from 'bcryptjs';
import Credentials from 'next-auth/providers/credentials';
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

    const user = await userRepository.findByEmail(email);
    if (!user?.passwordHash) {
      return null;
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
});
