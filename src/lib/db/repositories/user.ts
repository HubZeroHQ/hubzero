import { userSchema, type UserInput } from '@/lib/validation/user';
import type { User } from '@/types/cms';
import { collections } from '../collections';
import { createRepository } from '../repository';

const base = createRepository<User, UserInput>(collections.users);

export const userRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findByEmail: async (email: string) => (await collections.users()).findOne({ email }),
  create: (input: UserInput) => base.create(userSchema.parse(input)),
  update: (id: string, input: Partial<UserInput>) =>
    base.update(id, userSchema.partial().parse(input)),
};
