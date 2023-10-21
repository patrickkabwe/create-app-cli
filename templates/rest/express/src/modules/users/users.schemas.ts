import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  password: z.string(),
});

export const userCreateSchema = z.object({
  email: z.string(),
  name: z.string(),
  password: z.string(),
});

export const loginUserSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const usersSchema = z.array(userSchema);
