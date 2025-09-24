import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  // ✅ به جای ایمپورت مستقیم، مسیر دادی
  entities: [
    process.env.NODE_ENV === 'production'
      ? 'dist/src/entities/*.entity.js'
      : 'src/entities/*.entity.ts',
  ],

  migrations: [
    process.env.NODE_ENV === 'production'
      ? 'dist/src/migrations/*.js'
      : 'src/migrations/*.ts',
  ],

  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
