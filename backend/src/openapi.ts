// backend/src/openapi.ts
import { z } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenAPIGenerator,
} from "@asteasolutions/zod-to-openapi";
import { SignupSchema, LoginSchema, ForgotPasswordSchema, VerifyResetCodeSchema, ResetPasswordSchema, ChangePasswordSchema } from "./schemas/auth.schema";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// Register schemas with OpenAPI metadata
const SignupSchemaRef = registry.register(
  "SignupDto",
  SignupSchema.openapi({
    description: "Schema for user signup",
  })
);

const LoginSchemaRef = registry.register(
  "LoginDto",
  LoginSchema.openapi({
    description: "Schema for user login",
  })
);

const ForgotPasswordSchemaRef = registry.register(
  "ForgotPasswordDto",
  ForgotPasswordSchema.openapi({
    description: "Schema for forgot password request",
  })
);

const VerifyResetCodeSchemaRef = registry.register(
  "VerifyResetCodeDto",
  VerifyResetCodeSchema.openapi({
    description: "Schema for verifying reset code",
  })
);

const ResetPasswordSchemaRef = registry.register(
  "ResetPasswordDto",
  ResetPasswordSchema.openapi({
    description: "Schema for resetting password",
  })
);

const ChangePasswordSchemaRef = registry.register(
  "ChangePasswordDto",
  ChangePasswordSchema.openapi({
    description: "Schema for changing password (authenticated)",
  })
);

const AuthResponseSchema = registry.register(
  "AuthResponseDto",
  z.object({
    status: z.enum(['success', 'error', 'fail']),
    message: z.string(),
    data: z.object({
      token: z.string(),
    }).optional(),
  }).openapi({
    description: "Authentication response with token",
  })
);

const TokenResponseSchema = registry.register(
  "TokenResponseDto",
  z.object({
    status: z.enum(['success', 'error', 'fail']),
    message: z.string(),
    data: z.object({
      token: z.string(),
    }).optional(),
  }).openapi({
    description: "JWT token response",
  })
);

const PasswordActionResponseSchema = registry.register(
  "PasswordActionResponseDto",
  z.object({
    status: z.enum(['success', 'error', 'fail']),
    message: z.string(),
  }).openapi({
    description: "Password action response",
  })
);

const VerifyCodeResponseSchema = registry.register(
  "VerifyCodeResponseDto",
  z.object({
    status: z.enum(['success', 'error', 'fail']),
    message: z.string(),
    data: z.object({
      valid: z.boolean(),
    }).optional(),
  }).openapi({
    description: "Verify code response",
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

registry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
  summary: "Request password reset code",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ForgotPasswordSchemaRef,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Reset code sent if email exists",
      content: {
        "application/json": {
          schema: PasswordActionResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/verify-reset-code",
  summary: "Verify password reset code",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifyResetCodeSchemaRef,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Code verification result",
      content: {
        "application/json": {
          schema: VerifyCodeResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  summary: "Reset password with valid code",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResetPasswordSchemaRef,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Password reset successfully",
      content: {
        "application/json": {
          schema: PasswordActionResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid or expired code",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/change-password",
  summary: "Change password for authenticated user",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChangePasswordSchemaRef,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Password changed successfully",
      content: {
        "application/json": {
          schema: PasswordActionResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized or incorrect current password",
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

console.log(JSON.stringify(openapiDoc, null, 2));
