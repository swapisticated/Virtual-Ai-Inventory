// lib/prisma.js
import { PrismaClient } from '@/app/generated/prisma';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: process.env.NODE_ENV === 'production' 
          ? process.env.DIRECT_URL  
          : process.env.DATABASE_URL
      }
    }
  });
};

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;