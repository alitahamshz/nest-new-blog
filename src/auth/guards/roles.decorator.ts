import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * تعیین نقش‌های مجاز برای route
 * @param roles مثل 'admin', 'editor', 'user'
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
