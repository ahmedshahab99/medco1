import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { validateEnv } from '../../env'

declare const globalThis: {
  prismaGlobal: PrismaClient;
} & typeof global;

let prismaInstance: PrismaClient | null = null
let prismaInitError: Error | null = null

function getPrisma(): PrismaClient {
  if (prismaInstance) return prismaInstance
  if (prismaInitError) throw prismaInitError
  try {
    validateEnv()
    const connectionString = process.env.DATABASE_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    prismaInstance = new PrismaClient({ adapter })
    if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prismaInstance
    return prismaInstance
  } catch (e) {
    prismaInitError = e as Error
    throw e
  }
}

const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrisma() as any)[prop]
  },
})

export default prisma
