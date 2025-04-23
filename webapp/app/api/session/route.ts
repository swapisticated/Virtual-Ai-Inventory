import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  console.log("🔍 Incoming GET request to /api/session");

  let session;
  try {
    session = await auth();
    console.log("📦 Retrieved session:", session);
  } catch (error) {
    console.error("🔥 Error during session retrieval:", error);
    return new NextResponse(
      JSON.stringify({ status: "error", message: "Internal Server Error" }),
      { status: 500 }
    );
  }

  if (!session?.user) {
    console.log("❌ No authenticated user found.");
    return new NextResponse(
      JSON.stringify({ status: "fail", message: "You are not logged in" }),
      { status: 401 }
    );
  }

  console.log("✅ User is authenticated:", session.user);

  return NextResponse.json({
    authenticated: true,
    session,
  });
}

