import NextAuth from "next-auth"
import authConfig from "./auth.config"
<<<<<<< HEAD

import { PrismaClient } from "@/app/generated/prisma"
=======
 
import { PrismaClient } from '@/app/generated/prisma'
>>>>>>> origin/pydev
import { PrismaAdapter } from "@auth/prisma-adapter"
 
const prisma = new PrismaClient()
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
})