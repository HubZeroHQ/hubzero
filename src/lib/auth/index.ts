import { MongoDBAdapter } from '@auth/mongodb-adapter';
import NextAuth from 'next-auth';
import { getMongoClient } from '@/lib/db/mongodb';
import { serverEnv } from '@/lib/env';
import type { UserRole } from '@/types/cms';
import { credentialsProvider } from './providers/credentials';
import '@/types/auth';
import '@/types/auth-jwt';

/**
 * Auth.js foundation for CMS access only — there are no public visitor
 * accounts (PLANNING.md §37, §26.9).
 *
 * Session strategy is JWT rather than the adapter's database sessions:
 * Auth.js requires JWT sessions whenever a Credentials provider is present,
 * since there's no OAuth account for the adapter to persist a database
 * session against. The MongoDB adapter stays wired for a future OAuth
 * provider (§36-style extension); it isn't exercised by the Credentials
 * flow today.
 *
 * Permissions enforcement (Phase 1 priority 6, §29) lives in
 * lib/auth/permissions.ts and reads the role the `jwt`/`session` callbacks
 * attach here.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClient()),
  session: { strategy: 'jwt' },
  secret: serverEnv().AUTH_SECRET,
  providers: [credentialsProvider],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role ?? 'teamMember';
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id ?? '';
      session.user.role = token.role ?? 'teamMember';
      return session;
    },
  },
});
