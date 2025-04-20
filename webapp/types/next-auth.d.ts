// types/next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  // Extend the Session interface to include organizationId
  interface Session {
    user: {
      id: string
      organizationId?: string | null
    } & DefaultSession["user"] // Merge the default user properties with your custom ones
  }

  // Extend the User interface to include organizationId
  interface User {
    organizationId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    organizationId?: string | null
  }
}
