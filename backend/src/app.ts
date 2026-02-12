import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import logsRoutes from "./modules/logs/logs.routes";
import databasesRoutes from "./modules/databases/databases.routes";
import schemaRoutes, { publicSchemaRoutes } from "./modules/databases/schema/schema.routes";
import { crudRoutes } from "./modules/databases/crud";
import { springBootRoutes } from "./modules/databases/springboot";
import { expressRoutes } from "./modules/databases/express";
import { dotnetRoutes } from "./modules/databases/dotnet";
import { feedbackRoutes } from "./modules/feedback";
import { contactRoutes } from "./modules/contact";
import swaggerUi from "swagger-ui-express";
import { openapiDoc } from "./openapi";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

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

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all for now, remove this line to enforce
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/logs", logsRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/contact", contactRoutes);
// Public schema routes MUST come first (no auth required)
app.use("/databases", publicSchemaRoutes);
// Then authenticated routes
app.use("/databases", databasesRoutes);
app.use("/databases", crudRoutes); // Dynamic CRUD API endpoints - MUST be before schemaRoutes
app.use("/databases", schemaRoutes); // Custom query APIs (saved queries) - comes after CRUD
app.use("/databases", springBootRoutes); // Spring Boot project generation
app.use("/databases", expressRoutes); // Express.js project generation
app.use("/databases", dotnetRoutes); // .NET project generation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));
app.get("/openapi.json", (_req, res) => {
  res.json(openapiDoc);
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
