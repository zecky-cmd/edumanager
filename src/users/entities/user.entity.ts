import { User } from '@prisma/client';

export type { User };
export { RoleUser } from '@prisma/client';

export type SanitizedUser = Omit<User, 'password' | 'tokenReset' | 'tokenExpiry'>;
