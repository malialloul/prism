"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
// src/config/db.ts
const pg_1 = require("pg");
const isProduction = process.env.NODE_ENV === 'production';
exports.pool = new pg_1.Pool({
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'postgres',
    database: process.env.PG_DATABASE || 'prism',
    password: process.env.PG_PASSWORD || 'your_password',
    port: parseInt(process.env.PG_PORT || '5432'),
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
//# sourceMappingURL=db.js.map