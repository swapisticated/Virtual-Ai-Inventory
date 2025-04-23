import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
 
// Notice this is only an object, not a full Auth.js instance
export default {
  pages: {
    signIn: '/login',
  },
  providers: [Google, GitHub],
  callbacks: {
    async jwt({ token, user }) {
      // First time login, attach user ID to token
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string
      return session
    },
  },
} satisfies NextAuthConfig