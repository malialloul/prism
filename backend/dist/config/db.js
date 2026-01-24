"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
// src/config/db.ts
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    host: 'localhost',
    user: 'postgres',
    database: 'prism',
    password: 'postgres',
    port: 5432,
});
//# sourceMappingURL=db.js.map