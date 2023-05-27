import { prisma } from "~/libs/prisma";
import { RegisterPayload } from "../auth/auth.schemas";

export class UsersService {
  static async createUser(payload: RegisterPayload) {
    return await prisma.user.create({
      data: payload,
    });
  }
  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
