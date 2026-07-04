import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import authConfig from "@/lib/cms/auth.config";
import { connectToDatabase } from "@/lib/db";
import { User, type UserRole } from "@/models/user";
import type { SessionUser } from "@/types/cms";

declare module "next-auth" {
  interface User {
    role: UserRole;
    dynamicPermissions: string[];
    sessionVersion: number;
  }

  interface Session {
    user: SessionUser;
    /** Set when `sessionVersion` no longer matches — see the `session` callback below. */
    error?: "SessionRevoked";
  }
}

// Augmenting "@auth/core/jwt" rather than "next-auth/jwt" — with
// `moduleResolution: "bundler"`, TS can't resolve the latter specifier for
// declaration-merging purposes even though it re-exports from the former at
// runtime; augmenting the module the `JWT` interface actually originates
// from is the reliable target.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    dynamicPermissions: string[];
    sessionVersion: number;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    // Short-lived per `19_CMS_FOUNDATION.md` §2 — an admin panel handling
    // lead/contact data (and eventually draft business content) doesn't get
    // a long-lived "remember me" token.
    maxAge: 8 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        await connectToDatabase();
        // `.lean()` — a hydrated Mongoose Document's array fields are
        // `Types.Array` instances (Proxy-wrapped, not plain arrays), which
        // `structuredClone` can't serialize when Auth.js encrypts this
        // object into the JWT (surfaces as a `DataCloneError` on sign-in).
        // A plain object's `dynamicPermissions` is a real `string[]`.
        const user = await User.findOne({ email }).lean();
        // Same generic failure for "no such user" and "wrong password" —
        // never reveal which one was wrong (credential-enumeration hygiene,
        // `19_CMS_FOUNDATION.md` §2).
        if (!user) return null;

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          dynamicPermissions: [...user.dynamicPermissions],
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the initial sign-in call, straight from
      // `authorize()` above — every subsequent call re-uses the token as-is.
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.dynamicPermissions = user.dynamicPermissions;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      // Revocation check (`19_CMS_FOUNDATION.md` §2): re-read the user's
      // current `sessionVersion` from MongoDB every time a session is read
      // in the Node runtime (Server Components/Actions — middleware never
      // reaches this callback, see `auth.config.ts`). Bumping `sessionVersion`
      // (password change, or a future "sign out everywhere" action) forces
      // re-authentication on the next request without a session-storage
      // layer. This is the one deliberate database round-trip the JWT
      // strategy costs per session read.
      await connectToDatabase();
      const current = await User.findById(token.id).select("sessionVersion").lean();

      if (!current || current.sessionVersion !== token.sessionVersion) {
        // Returning a fresh object here (rather than mutating the
        // destructured `session`) sidesteps a next-auth v5 typings quirk:
        // the callback's `session` parameter type is an intersection of its
        // database-strategy and JWT-strategy shapes, so assigning into
        // `session.user` directly requires satisfying both — a constraint
        // that doesn't reflect this app's JWT-only `session.strategy`.
        return { ...session, error: "SessionRevoked" as const };
      }

      return {
        ...session,
        user: {
          id: token.id,
          email: token.email ?? "",
          name: token.name ?? "",
          role: token.role,
          dynamicPermissions: token.dynamicPermissions,
        },
      };
    },
  },
});
