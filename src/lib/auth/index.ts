import { MongoDBAdapter } from '@auth/mongodb-adapter';
import NextAuth from 'next-auth';
import { getMongoClient } from '@/lib/db/mongodb';
import { serverEnv } from '@/lib/env';
import { authConfig } from './config';
import { credentialsProvider } from './providers/credentials';

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
 *
 * This is the Node-runtime half of the config — it adds the MongoDB
 * adapter and the Credentials provider on top of the shared, edge-safe
 * `authConfig` (`./config.ts`). Never import this module from
 * `middleware.ts`; the `mongodb` driver it pulls in doesn't run on the
 * Edge runtime middleware executes under.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(getMongoClient()),
  secret: serverEnv().AUTH_SECRET,
  providers: [credentialsProvider],
});
