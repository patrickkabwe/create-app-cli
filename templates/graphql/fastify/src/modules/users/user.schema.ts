import * as z from 'zod'

export const UserSchema = z.object({
  name: z.string(),
  phoneNumber: z.string().min(10).max(10),
  email: z.string().email(),
  password: z.string().min(5),
})

export type UserPayload = z.infer<typeof UserSchema>
