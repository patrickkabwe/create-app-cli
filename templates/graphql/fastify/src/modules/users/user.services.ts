import type { Prisma, PrismaClient } from '@prisma/client'

export async function createUser(
  prisma: PrismaClient,
  data: Prisma.UserCreateInput,
) {
  const newUser = await prisma.user.create({
    data,
  })
  return newUser
}

export async function getUserById(prisma: PrismaClient, id: string) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })
  return user
}

export async function getUserByEmail(prisma: PrismaClient, email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })
  return user
}

export async function updateUser(
  prisma: PrismaClient,
  id: string,
  data: Prisma.UserUpdateInput,
) {
  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data,
  })
  return updatedUser
}
