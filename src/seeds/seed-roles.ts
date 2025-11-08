import 'dotenv/config';
import { AppDataSource } from '../../data-source';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('DataSource initialized');

    const roleRepo = AppDataSource.getRepository(Role);
    const userRepo = AppDataSource.getRepository(User);

    const rolesToEnsure = ['admin', 'seller', 'customer', 'user'];

    const createdRoles: Role[] = [];
    for (const roleName of rolesToEnsure) {
      let role = await roleRepo.findOne({ where: { name: roleName } });
      if (!role) {
        role = roleRepo.create({ name: roleName });
        await roleRepo.save(role);
        console.log(`Created role: ${roleName}`);
      } else {
        console.log(`Role already exists: ${roleName}`);
      }
      createdRoles.push(role);
    }

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';

    let admin: User | null = await userRepo.findOne({
      where: { email: adminEmail },
    });
    if (!admin) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      const adminRole = createdRoles.find((r) => r.name === 'admin')!;
      const adminData: Partial<User> = {
        email: adminEmail,
        password: hashed,
        name: 'Administrator',
        roles: [adminRole],
      };

      admin = userRepo.create(adminData as User);
      await userRepo.save(admin);
      console.log(`Created admin user: ${adminEmail}`);
    } else {
      // ensure admin has ADMIN role
      const adminRole = createdRoles.find((r) => r.name === 'admin')!;
      if (!admin.roles || !admin.roles.find((r) => r.name === 'admin')) {
        admin.roles = admin.roles ? [...admin.roles, adminRole] : [adminRole];
        await userRepo.save(admin as any);
        console.log(`Added ADMIN role to existing user: ${adminEmail}`);
      } else {
        console.log(`Admin user already exists with ADMIN role: ${adminEmail}`);
      }
    }

    console.log('Seeding finished.');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    try {
      await AppDataSource.destroy();
    } catch (destroyErr) {
      console.warn('Error while destroying DataSource:', destroyErr);
    }
    process.exit(1);
  }
}

// avoid unhandled promise
void seed();
