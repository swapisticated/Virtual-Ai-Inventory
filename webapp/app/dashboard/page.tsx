import { SessionProvider } from "next-auth/react";
import Dashboard from "./Dashboard";
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"


export default async function  DashboardPage() {
  
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findFirst({
    where: { id: session.user.id },
    include: { organization: true },
  })

  if (!user?.organization) {
    redirect("/onboarding")
  }

  return (
    <SessionProvider>
      <Dashboard />
    </SessionProvider>
  );
}
