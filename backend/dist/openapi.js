"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openapiDoc = void 0;
// backend/src/openapi.ts
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const auth_schema_1 = require("./schemas/auth.schema");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
const registry = new zod_to_openapi_1.OpenAPIRegistry();
// Register schemas with OpenAPI metadata
const SignupSchemaRef = registry.register("SignupDto", auth_schema_1.SignupSchema.openapi({
    description: "Schema for user signup",
}));
const LoginSchemaRef = registry.register("LoginDto", auth_schema_1.LoginSchema.openapi({
    description: "Schema for user login",
}));
const ForgotPasswordSchemaRef = registry.register("ForgotPasswordDto", auth_schema_1.ForgotPasswordSchema.openapi({
    description: "Schema for forgot password request",
}));
const VerifyResetCodeSchemaRef = registry.register("VerifyResetCodeDto", auth_schema_1.VerifyResetCodeSchema.openapi({
    description: "Schema for verifying reset code",
}));
const ResetPasswordSchemaRef = registry.register("ResetPasswordDto", auth_schema_1.ResetPasswordSchema.openapi({
    description: "Schema for resetting password",
}));
const ChangePasswordSchemaRef = registry.register("ChangePasswordDto", auth_schema_1.ChangePasswordSchema.openapi({
    description: "Schema for changing password (authenticated)",
}));
const ChangeEmailSchemaRef = registry.register("ChangeEmailDto", auth_schema_1.ChangeEmailSchema.openapi({
    description: "Schema for changing email (authenticated)",
}));
const UserSchemaRef = registry.register("UserDto", auth_schema_1.PublicUserSchema.openapi({
    description: "User data transfer object",
}));
const AuthResponseSchema = registry.register("AuthResponseDto", zod_1.z.object({
    status: zod_1.z.enum(['success', 'error', 'fail']),
    message: zod_1.z.string(),
    data: zod_1.z.object({
        token: zod_1.z.string(),
    }).optional(),
}).openapi({
    description: "Authentication response with token",
}));
const TokenResponseSchema = registry.register("TokenResponseDto", zod_1.z.object({
    status: zod_1.z.enum(['success', 'error', 'fail']),
    message: zod_1.z.string(),
    data: zod_1.z.object({
        token: zod_1.z.string(),
    }).optional(),
}).openapi({
    description: "JWT token response",
}));
const PasswordActionResponseSchema = registry.register("PasswordActionResponseDto", zod_1.z.object({
    status: zod_1.z.enum(['success', 'error', 'fail']),
    message: zod_1.z.string(),
}).openapi({
    description: "Password action response",
}));
const ChangeEmailResponseSchema = registry.register("ChangeEmailResponseDto", zod_1.z.object({
    status: zod_1.z.enum(['success', 'error', 'fail']),
    message: zod_1.z.string(),
    data: zod_1.z.object({
        token: zod_1.z.string(),
    }).optional(),
}).openapi({
    description: "Change email response with new token",
}));
// 2FA Schemas
const Setup2FASchemaRef = registry.register("Setup2FADto", auth_schema_1.Setup2FASchema.openapi({
    description: "Schema for setting up 2FA",
}));
const Verify2FASchemaRef = registry.register("Verify2FADto", auth_schema_1.Verify2FASchema.openapi({
    description: "Schema for verifying 2FA code",
}));
const Disable2FASchemaRef = registry.register("Disable2FADto", auth_schema_1.Disable2FASchema.openapi({
    description: "Schema for disabling 2FA",
}));
const Login2FASchemaRef = registry.register("Login2FADto", auth_schema_1.Login2FASchema.openapi({
    description: "Schema for 2FA login verification",
}));
const TwoFactorStatusResponseSchema = registry.register("TwoFactorStatusResponseDto", zod_1.z.object({
    status: zod_1.z.enum(['success', 'error', 'fail']),
    message: zod_1.z.string(),
    data: zod_1.z.object({
        enabled: zod_1.z.boolean(),
    }).optional(),
}).openapi({
    description: "2FA status response",
}));
const Setup2FAResponseSchema = registry.register("Setup2FAResponseDto", zod_1.z.object({
    status: zod_1.z.enum(['success', 'error', 'fail']),
    message: zod_1.z.string(),
    data: zod_1.z.object({
        qrCode: zod_1.z.string(),
        secret: zod_1.z.string(),
    }).optional(),
}).openapi({
    description: "2FA setup response with QR code",
}));
const Verify2FAResponseSchema = registry.register("Verify2FAResponseDto", zod_1.z.object({
    status: zod_1.z.enum(['success', 'error', 'fail']),
    message: zod_1.z.string(),
    data: zod_1.z.object({
        backupCodes: zod_1.z.array(zod_1.z.string()),
    }).optional(),
}).openapi({
    description: "2FA verification response with backup codes",
}));
const Login2FARequiredResponseSchema = registry.register("Login2FARequiredResponseDto", zod_1.z.object({
    status: zod_1.z.enum(['success', 'error', 'fail']),
    message: zod_1.z.string(),
    data: zod_1.z.object({
        requires2FA: zod_1.z.boolean(),
        tempToken: zod_1.z.string(),
        email: zod_1.z.string(),
    }).optional(),
}).openapi({
    description: "Login response when 2FA is required",
}));
const VerifyCodeResponseSchema = registry.register("VerifyCodeResponseDto", zod_1.z.object({
    status: zod_1.z.enum(['success', 'error', 'fail']),
    message: zod_1.z.string(),
    data: zod_1.z.object({
        valid: zod_1.z.boolean(),
    }).optional(),
}).openapi({
    description: "Verify code response",
}));
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
// =============================================================================
// Dynamic CRUD API Schemas and Endpoints
// =============================================================================
const PaginationSchema = registry.register("PaginationDto", zod_1.z.object({
    page: zod_1.z.number(),
    limit: zod_1.z.number(),
    total: zod_1.z.number(),
    totalPages: zod_1.z.number(),
    hasNext: zod_1.z.boolean(),
    hasPrev: zod_1.z.boolean(),
}).openapi({
    description: "Pagination metadata",
}));
const CrudRecordSchema = registry.register("CrudRecordDto", zod_1.z.record(zod_1.z.unknown()).openapi({
    description: "Dynamic record from database table",
}));
const ListRecordsResponseSchema = registry.register("ListRecordsResponseDto", zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.array(zod_1.z.record(zod_1.z.unknown())),
    pagination: zod_1.z.object({
        page: zod_1.z.number(),
        limit: zod_1.z.number(),
        total: zod_1.z.number(),
        totalPages: zod_1.z.number(),
        hasNext: zod_1.z.boolean(),
        hasPrev: zod_1.z.boolean(),
    }),
}).openapi({
    description: "Paginated list of records",
}));
const GetRecordResponseSchema = registry.register("GetRecordResponseDto", zod_1.z.object({
    success: zod_1.z.boolean(),
    record: zod_1.z.record(zod_1.z.unknown()),
}).openapi({
    description: "Single record response",
}));
const CreateRecordResponseSchema = registry.register("CreateRecordResponseDto", zod_1.z.object({
    success: zod_1.z.boolean(),
    record: zod_1.z.record(zod_1.z.unknown()),
    message: zod_1.z.string(),
}).openapi({
    description: "Created record response",
}));
const TableRelationSchema = registry.register("TableRelationDto", zod_1.z.object({
    table: zod_1.z.string(),
    column: zod_1.z.string(),
    referencedTable: zod_1.z.string(),
    referencedColumn: zod_1.z.string(),
    type: zod_1.z.enum(['one-to-many', 'many-to-one']),
}).openapi({
    description: "Table foreign key relation",
}));
// CRUD API - List Records
registry.registerPath({
    method: "get",
    path: "/databases/{id}/api/{table}",
    summary: "List records",
    description: "List records from a table with pagination, filtering, sorting, and search",
    tags: ["CRUD API"],
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            id: zod_1.z.string().describe("Database ID"),
            table: zod_1.z.string().describe("Table name"),
        }),
        query: zod_1.z.object({
            page: zod_1.z.string().optional().describe("Page number (default: 1)"),
            limit: zod_1.z.string().optional().describe("Records per page (default: 20, max: 100)"),
            sortBy: zod_1.z.string().optional().describe("Column to sort by"),
            sortOrder: zod_1.z.enum(["asc", "desc"]).optional().describe("Sort direction"),
            search: zod_1.z.string().optional().describe("Text search across searchable columns"),
        }),
    },
    responses: {
        200: {
            description: "List of records",
            content: {
                "application/json": {
                    schema: ListRecordsResponseSchema,
                },
            },
        },
    },
});
// CRUD API - Get Record by ID
registry.registerPath({
    method: "get",
    path: "/databases/{id}/api/{table}/{recordId}",
    summary: "Get record by ID",
    description: "Get a single record by its primary key",
    tags: ["CRUD API"],
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            id: zod_1.z.string().describe("Database ID"),
            table: zod_1.z.string().describe("Table name"),
            recordId: zod_1.z.string().describe("Record primary key"),
        }),
    },
    responses: {
        200: {
            description: "Record found",
            content: {
                "application/json": {
                    schema: GetRecordResponseSchema,
                },
            },
        },
        404: {
            description: "Record not found",
        },
    },
});
// CRUD API - Create Record
registry.registerPath({
    method: "post",
    path: "/databases/{id}/api/{table}",
    summary: "Create record",
    description: "Create a new record in the table",
    tags: ["CRUD API"],
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            id: zod_1.z.string().describe("Database ID"),
            table: zod_1.z.string().describe("Table name"),
        }),
        body: {
            content: {
                "application/json": {
                    schema: zod_1.z.record(zod_1.z.unknown()).describe("Record data"),
                },
            },
        },
    },
    responses: {
        201: {
            description: "Record created",
            content: {
                "application/json": {
                    schema: CreateRecordResponseSchema,
                },
            },
        },
        400: {
            description: "Validation error",
        },
    },
});
// CRUD API - Update Records (PUT) - filter-based
registry.registerPath({
    method: "put",
    path: "/databases/{id}/api/{table}",
    summary: "Update records (full)",
    description: "Fully update records matching the specified filters. Filters are passed as query parameters (e.g., ?id=1 or ?status__eq=active)",
    tags: ["CRUD API"],
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            id: zod_1.z.string().describe("Database ID"),
            table: zod_1.z.string().describe("Table name"),
        }),
        body: {
            content: {
                "application/json": {
                    schema: zod_1.z.record(zod_1.z.unknown()).describe("Updated record data"),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Records updated",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        success: zod_1.z.boolean(),
                        message: zod_1.z.string(),
                        updatedCount: zod_1.z.number(),
                    }),
                },
            },
        },
        400: {
            description: "At least one filter is required",
        },
    },
});
// CRUD API - Update Records (PATCH) - filter-based
registry.registerPath({
    method: "patch",
    path: "/databases/{id}/api/{table}",
    summary: "Update records (partial)",
    description: "Partially update records matching the specified filters. Filters are passed as query parameters (e.g., ?id=1 or ?status__eq=active)",
    tags: ["CRUD API"],
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            id: zod_1.z.string().describe("Database ID"),
            table: zod_1.z.string().describe("Table name"),
        }),
        body: {
            content: {
                "application/json": {
                    schema: zod_1.z.record(zod_1.z.unknown()).describe("Partial record data"),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Records updated",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        success: zod_1.z.boolean(),
                        message: zod_1.z.string(),
                        updatedCount: zod_1.z.number(),
                    }),
                },
            },
        },
        400: {
            description: "At least one filter is required",
        },
    },
});
// CRUD API - Delete Records - filter-based
registry.registerPath({
    method: "delete",
    path: "/databases/{id}/api/{table}",
    summary: "Delete records",
    description: "Delete records matching the specified filters. Filters are passed as query parameters (e.g., ?id=1 or ?status__eq=active)",
    tags: ["CRUD API"],
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            id: zod_1.z.string().describe("Database ID"),
            table: zod_1.z.string().describe("Table name"),
        }),
    },
    responses: {
        200: {
            description: "Records deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        success: zod_1.z.boolean(),
                        message: zod_1.z.string(),
                        deletedCount: zod_1.z.number(),
                    }),
                },
            },
        },
        400: {
            description: "At least one filter is required",
        },
    },
});
// CRUD API - Get Table Relations
registry.registerPath({
    method: "get",
    path: "/databases/{id}/api/{table}/relations",
    summary: "Get table relations",
    description: "Get foreign key relations for a table",
    tags: ["CRUD API"],
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            id: zod_1.z.string().describe("Database ID"),
            table: zod_1.z.string().describe("Table name"),
        }),
    },
    responses: {
        200: {
            description: "Table relations",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        success: zod_1.z.boolean(),
                        relations: zod_1.z.array(TableRelationSchema),
                    }),
                },
            },
        },
    },
});
// CRUD API - Get Related Records (Nested Route)
registry.registerPath({
    method: "get",
    path: "/databases/{id}/api/{table}/{recordId}/{relatedTable}",
    summary: "Get related records",
    description: "Get records from a related table (e.g., /users/5/orders gets all orders for user 5)",
    tags: ["CRUD API"],
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            id: zod_1.z.string().describe("Database ID"),
            table: zod_1.z.string().describe("Parent table name"),
            recordId: zod_1.z.string().describe("Parent record primary key"),
            relatedTable: zod_1.z.string().describe("Related table name"),
        }),
        query: zod_1.z.object({
            page: zod_1.z.string().optional(),
            limit: zod_1.z.string().optional(),
            sortBy: zod_1.z.string().optional(),
            sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
        }),
    },
    responses: {
        200: {
            description: "Related records",
            content: {
                "application/json": {
                    schema: ListRecordsResponseSchema,
                },
            },
        },
        400: {
            description: "No relation found between tables",
        },
    },
});
// Generate OpenAPI document
const generator = new zod_to_openapi_1.OpenAPIGenerator(registry.definitions, "3.0.0");
exports.openapiDoc = generator.generateDocument({
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
console.log(JSON.stringify(exports.openapiDoc, null, 2));
//# sourceMappingURL=openapi.js.map