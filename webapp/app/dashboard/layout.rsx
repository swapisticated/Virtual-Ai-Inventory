import Dock from "@/components/Dock";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Home, Info, Phone } from "lucide-react";


export default async function DashboardLayout({ children }) {
  const session = await getServerSession();
  if (!session) redirect("/signin");

  return (
    <div className="flex min-h-screen">
      <Dock />
      <div className="flex-grow p-4">{children}</div>
    </div>
  );
}
