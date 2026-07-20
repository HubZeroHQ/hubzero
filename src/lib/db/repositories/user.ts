import { userSchema, type UserInput } from '@/lib/validation/user';
import type { User } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<User, UserInput>(collections.users);

export const userRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  // Every write path stores email trimmed and lowercased (`userSchema` /
  // the account-creation scripts) — normalize the lookup key the same way,
  // or an exact-match query silently misses a real account just because the
  // caller (e.g. a login form) sent different casing or padding.
  findByEmail: async (email: string) =>
    (await collections.users()).findOne({ email: email.trim().toLowerCase() }),
  create: (input: UserInput) => base.create(userSchema.parse(input)),
  update: (id: string, input: Partial<UserInput>) =>
    base.update(id, parsePartialInput(userSchema, input)),
};
