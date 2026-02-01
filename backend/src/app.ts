import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import logsRoutes from "./modules/logs/logs.routes";
import databasesRoutes from "./modules/databases/databases.routes";
import schemaRoutes, { publicSchemaRoutes } from "./modules/databases/schema/schema.routes";
import { crudRoutes } from "./modules/databases/crud";
import swaggerUi from "swagger-ui-express";
import { openapiDoc } from "./openapi";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/logs", logsRoutes);
// Public schema routes MUST come first (no auth required)
app.use("/databases", publicSchemaRoutes);
// Then authenticated routes
app.use("/databases", databasesRoutes);
app.use("/databases", crudRoutes); // Dynamic CRUD API endpoints - MUST be before schemaRoutes
app.use("/databases", schemaRoutes); // Custom query APIs (saved queries) - comes after CRUD
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));
app.get("/openapi.json", (_req, res) => {
  res.json(openapiDoc);
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
