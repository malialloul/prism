import { z } from "zod";
import { registerTable } from "../config/schema-registry";

// User table schema - automatically creates 'users' table
export const UserSchema = registerTable(
  "users",
  z.object({
    email: z.string().email(),
    passwordHash: z.string(),
    fullName: z.string().optional(),
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      email: { unique: true },
    },
  }
);

// Request/Response schemas (not registered as tables)
export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type UserDto = z.infer<typeof UserSchema>;
export type SignupDto = z.infer<typeof SignupSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
