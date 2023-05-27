import { z } from "zod";

const authBaseSchema = {
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({
      message: "Email must be a valid email",
    }),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
};

export const loginUserSchema = z.object({
  ...authBaseSchema,
});

export const registerUserSchema = z.object({
  ...authBaseSchema,
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
});

export type LoginPayload = z.infer<typeof loginUserSchema>;
export type RegisterPayload = z.infer<typeof registerUserSchema>;
