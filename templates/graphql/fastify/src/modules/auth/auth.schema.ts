import * as z from 'zod'
import type { UserSchema } from '~/modules/users/user.schema'

export const UserLoginSchema = z.object({
  phoneNumber: z.string().min(10).max(10),
  password: z.string(),
})

export type UserPayload = z.infer<typeof UserSchema>
export type UserLoginPayload = z.infer<typeof UserLoginSchema>
