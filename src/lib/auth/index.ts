import { MongoDBAdapter } from '@auth/mongodb-adapter';
import NextAuth from 'next-auth';
import { getMongoClient } from '@/lib/db/mongodb';
import { serverEnv } from '@/lib/env';
import '@/types/auth';

/**
 * Auth.js foundation for CMS access only — there are no public visitor
 * accounts (PLANNING.md §37, §26.9). This wires the session model
 * (MongoDB-backed, AUTH_SECRET-signed) that later phases build on.
 *
 * Deliberately out of scope here: sign-in providers and the role-based
 * permissions middleware (Head Admin / Admin / Team Member, §29) both land
 * in Phase 3, once the Users collection and its CRUD actually exist.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClient()),
  session: { strategy: 'database' },
  secret: serverEnv().AUTH_SECRET,
  providers: [],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role ?? 'teamMember';
      return session;
    },
  },
});
