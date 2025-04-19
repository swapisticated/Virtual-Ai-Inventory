// app/login/page.tsx
import React from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import { signIn } from "@/auth"


export default function Login() {
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm space-y-6 text-center px-6">

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="text-sm text-zinc-400">Continue where you left off</p>
        </div>

        {/* Login Buttons */}
        <div className="space-y-4">
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/dashboard" })
            }}
          >
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium bg-[#5f5ef6] text-white hover:bg-[#4f4ef3] transition">
              Continue with Google
            </button>    </form>


          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition">
            <Mail className="text-lg" />
            Continue with Email
          </button>
        </div>

        {/* Subtle Note
        <p className="text-xs text-zinc-500 leading-snug">
          Secure, fast and reliable access to your account
        </p> */}

        {/* Footer */}
        <p className="text-xs text-zinc-500">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-white hover:underline">
            <span>Sign up</span>
          </Link>
        </p>

      </div>
    </div>
  );
}
