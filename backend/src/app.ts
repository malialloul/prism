import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import swaggerUi from "swagger-ui-express";
import { openapiDoc } from "./openapi";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));
app.get("/openapi.json", (_req, res) => {
  res.json(openapiDoc);
});
export default app;
