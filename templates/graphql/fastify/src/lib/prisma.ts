import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
  var _db_: PrismaClient
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['info', 'warn'],
  })
} else {
  if (!global._db_) {
    global._db_ = new PrismaClient({
      log: ['info', 'warn'],
    })
  }
  prisma = global._db_
}

export { prisma }
