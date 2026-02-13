"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const logs_routes_1 = __importDefault(require("./modules/logs/logs.routes"));
const databases_routes_1 = __importDefault(require("./modules/databases/databases.routes"));
const schema_routes_1 = __importStar(require("./modules/databases/schema/schema.routes"));
const crud_1 = require("./modules/databases/crud");
const springboot_1 = require("./modules/databases/springboot");
const express_2 = require("./modules/databases/express");
const dotnet_1 = require("./modules/databases/dotnet");
const feedback_1 = require("./modules/feedback");
const contact_1 = require("./modules/contact");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const openapi_1 = require("./openapi");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    // Netlify domains
    /\.netlify\.app$/,
    // Vercel domains
    /\.vercel\.app$/,
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin)
            return callback(null, true);
        // Check if origin matches allowed list
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp)
                return allowed.test(origin);
            return allowed === origin;
        });
        if (isAllowed) {
            callback(null, true);
        }
        else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow all for now, remove this line to enforce
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/auth", auth_routes_1.default);
app.use("/logs", logs_routes_1.default);
app.use("/feedback", feedback_1.feedbackRoutes);
app.use("/contact", contact_1.contactRoutes);
// Public schema routes MUST come first (no auth required)
app.use("/databases", schema_routes_1.publicSchemaRoutes);
// Then authenticated routes
app.use("/databases", databases_routes_1.default);
app.use("/databases", crud_1.crudRoutes); // Dynamic CRUD API endpoints - MUST be before schemaRoutes
app.use("/databases", schema_routes_1.default); // Custom query APIs (saved queries) - comes after CRUD
app.use("/databases", springboot_1.springBootRoutes); // Spring Boot project generation
app.use("/databases", express_2.expressRoutes); // Express.js project generation
app.use("/databases", dotnet_1.dotnetRoutes); // .NET project generation
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_1.openapiDoc));
app.get("/openapi.json", (_req, res) => {
    res.json(openapi_1.openapiDoc);
});
// Global error handler (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map