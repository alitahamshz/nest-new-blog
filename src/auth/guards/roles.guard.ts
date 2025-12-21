/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // اگر نقش خاصی نیاز نیست
    }

    const { user } = context.switchToHttp().getRequest();
    console.log({ user, requiredRoles });

    if (!user) {
      return false;
    }

    // user.roles یک array از Role objects است
    if (!user.roles || !Array.isArray(user.roles)) {
      console.error('User roles not found or not an array');
      return false;
    }

    // نام نقش‌های کاربر را استخراج کن
    const userRoleNames = user.roles.map((role: { name: string }) => role.name);
    console.log({ userRoleNames });

    // بررسی اینکه کاربر یکی از نقش‌های مورد نیاز را داشته باشد
    return requiredRoles.some((role) => userRoleNames.includes(role));
  }
}
