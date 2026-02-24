"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv/config");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [
        process.env.NODE_ENV === 'production'
            ? 'dist/src/entities/*.entity.js'
            : 'src/entities/*.entity.ts',
    ],
    migrations: [
        process.env.NODE_ENV === 'production'
            ? 'dist/src/migrations/*.js'
            : 'src/migrations/*.{ts,js}',
    ],
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
});
//# sourceMappingURL=data-source.js.map