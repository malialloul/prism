// backend/src/openapi.ts
import { z } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenAPIGenerator,
} from "@asteasolutions/zod-to-openapi";
import { SignupSchema, LoginSchema } from "./schemas/auth.schema";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// Register schemas with OpenAPI metadata
const SignupSchemaRef = registry.register(
  "Signup",
  SignupSchema.openapi({
    description: "Schema for user signup",
  })
);

const LoginSchemaRef = registry.register(
  "Login",
  LoginSchema.openapi({
    description: "Schema for user login",
  })
);

const AuthResponseSchema = registry.register(
  "AuthResponse",
  z.object({
    message: z.string(),
    user: z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
    }).optional(),
  }).openapi({
    description: "Authentication response",
  })
);

const TokenResponseSchema = registry.register(
  "TokenResponse",
  z.object({
    token: z.string(),
    expiresIn: z.number(),
  }).openapi({
    description: "JWT token response",
  })
);

// Register API paths
registry.registerPath({
  method: "post",
  path: "/auth/signup",
  summary: "Create a new user account",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignupSchemaRef,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: AuthResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
    },
    409: {
      description: "User already exists",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "Authenticate user and get JWT token",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchemaRef,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: TokenResponseSchema,
        },
      },
    },
    401: {
      description: "Invalid credentials",
    },
  },
});

// Generate OpenAPI document
const generator = new OpenAPIGenerator(registry.definitions, "3.0.0");

export const openapiDoc = generator.generateDocument({
  info: {
    title: "Auth API",
    version: "1.0.0",
    description: "Authentication API for Cloud API Builder",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Development server",
    },
  ],
});
