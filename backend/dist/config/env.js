"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST
dotenv_1.default.config();
// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'PG_HOST', 'PG_DATABASE'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}
// Export validated config
exports.config = {
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d'),
    },
    postgres: {
        host: process.env.PG_HOST,
        port: parseInt(process.env.PG_PORT || '5432', 10),
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || '',
        database: process.env.PG_DATABASE,
    },
    server: {
        port: parseInt(process.env.PORT || '4000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
};
//# sourceMappingURL=env.js.map