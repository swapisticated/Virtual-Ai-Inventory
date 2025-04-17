// app/signup/page.tsx
"use client";
import React from "react";
import { Mail, UserPlus } from "lucide-react";
import Link from "next/link";

export default function Signup() {
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm space-y-6 text-center px-6">

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Create your account</h2>
          <p className="text-sm text-zinc-400">Start your journey with us</p>
        </div>

        {/* Signup Options */}
        <div className="space-y-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium bg-[#5f5ef6] text-white hover:bg-[#4f4ef3] transition">
            <UserPlus className="text-lg" />
            Sign up with Google
          </button>

          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition">
            <Mail className="text-lg" />
            Sign up with Email
          </button>
        </div>

        {/* Terms Notice */}
        <p className="text-xs text-zinc-500 leading-snug">
          By signing up, you agree that you{" "}
          <span className="underline cursor-pointer hover:text-white">love</span>{" "}
          {" "} this {" "}
          <span className="underline cursor-pointer hover:text-white">app</span>.
        </p>

        {/* Footer */}
        <p className="text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            <span>Log in</span>
          </Link>
        </p>

      </div>
    </div>
  );
}
