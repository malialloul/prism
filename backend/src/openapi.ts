// backend/src/openapi.ts
import { z } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenAPIGenerator,
} from "@asteasolutions/zod-to-openapi";
import { SignupSchema, LoginSchema, ForgotPasswordSchema, VerifyResetCodeSchema, ResetPasswordSchema, ChangePasswordSchema, ChangeEmailSchema, PublicUserSchema, Setup2FASchema, Verify2FASchema, Disable2FASchema, Login2FASchema } from "./schemas/auth.schema";

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

const ChangeEmailSchemaRef = registry.register(
  "ChangeEmailDto",
  ChangeEmailSchema.openapi({
    description: "Schema for changing email (authenticated)",
  })
);

const UserSchemaRef = registry.register(
  "UserDto",
  PublicUserSchema.openapi({
    description: "User data transfer object",
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

const ChangeEmailResponseSchema = registry.register(
  "ChangeEmailResponseDto",
  z.object({
    status: z.enum(['success', 'error', 'fail']),
    message: z.string(),
    data: z.object({
      token: z.string(),
    }).optional(),
  }).openapi({
    description: "Change email response with new token",
  })
);

// 2FA Schemas
const Setup2FASchemaRef = registry.register(
  "Setup2FADto",
  Setup2FASchema.openapi({
    description: "Schema for setting up 2FA",
  })
);

const Verify2FASchemaRef = registry.register(
  "Verify2FADto",
  Verify2FASchema.openapi({
    description: "Schema for verifying 2FA code",
  })
);

const Disable2FASchemaRef = registry.register(
  "Disable2FADto",
  Disable2FASchema.openapi({
    description: "Schema for disabling 2FA",
  })
);

const Login2FASchemaRef = registry.register(
  "Login2FADto",
  Login2FASchema.openapi({
    description: "Schema for 2FA login verification",
  })
);

const TwoFactorStatusResponseSchema = registry.register(
  "TwoFactorStatusResponseDto",
  z.object({
    status: z.enum(['success', 'error', 'fail']),
    message: z.string(),
    data: z.object({
      enabled: z.boolean(),
    }).optional(),
  }).openapi({
    description: "2FA status response",
  })
);

const Setup2FAResponseSchema = registry.register(
  "Setup2FAResponseDto",
  z.object({
    status: z.enum(['success', 'error', 'fail']),
    message: z.string(),
    data: z.object({
      qrCode: z.string(),
      secret: z.string(),
    }).optional(),
  }).openapi({
    description: "2FA setup response with QR code",
  })
);

const Verify2FAResponseSchema = registry.register(
  "Verify2FAResponseDto",
  z.object({
    status: z.enum(['success', 'error', 'fail']),
    message: z.string(),
    data: z.object({
      backupCodes: z.array(z.string()),
    }).optional(),
  }).openapi({
    description: "2FA verification response with backup codes",
  })
);

const Login2FARequiredResponseSchema = registry.register(
  "Login2FARequiredResponseDto",
  z.object({
    status: z.enum(['success', 'error', 'fail']),
    message: z.string(),
    data: z.object({
      requires2FA: z.boolean(),
      tempToken: z.string(),
      email: z.string(),
    }).optional(),
  }).openapi({
    description: "Login response when 2FA is required",
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

registry.registerPath({
  method: "post",
  path: "/auth/change-email",
  summary: "Change email for authenticated user",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChangeEmailSchemaRef,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Email changed successfully, returns new token",
      content: {
        "application/json": {
          schema: ChangeEmailResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized or incorrect password",
    },
    409: {
      description: "Email already exists",
    },
  },
});

// 2FA API Paths
registry.registerPath({
  method: "get",
  path: "/auth/2fa/status",
  summary: "Get 2FA status for authenticated user",
  tags: ["Two-Factor Authentication"],
  responses: {
    200: {
      description: "2FA status retrieved",
      content: {
        "application/json": {
          schema: TwoFactorStatusResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/2fa/setup",
  summary: "Setup 2FA for authenticated user",
  tags: ["Two-Factor Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: Setup2FASchemaRef,
        },
      },
    },
  },
  responses: {
    200: {
      description: "2FA setup initiated, returns QR code",
      content: {
        "application/json": {
          schema: Setup2FAResponseSchema,
        },
      },
    },
    400: {
      description: "2FA already enabled or invalid password",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/2fa/verify",
  summary: "Verify 2FA code and enable 2FA",
  tags: ["Two-Factor Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: Verify2FASchemaRef,
        },
      },
    },
  },
  responses: {
    200: {
      description: "2FA enabled successfully, returns backup codes",
      content: {
        "application/json": {
          schema: Verify2FAResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid verification code",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/2fa/disable",
  summary: "Disable 2FA for authenticated user",
  tags: ["Two-Factor Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: Disable2FASchemaRef,
        },
      },
    },
  },
  responses: {
    200: {
      description: "2FA disabled successfully",
      content: {
        "application/json": {
          schema: PasswordActionResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid password or code",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login/2fa",
  summary: "Complete login with 2FA code",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: Login2FASchemaRef,
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
    400: {
      description: "Invalid verification code",
    },
    401: {
      description: "Invalid or expired session",
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
