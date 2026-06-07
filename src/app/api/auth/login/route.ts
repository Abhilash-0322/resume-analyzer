import { NextRequest, NextResponse } from "next/server";
import { AuthError, authCookieOptions, authenticateUser, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await authenticateUser(email, password);
    const token = await signToken(user);
    const response = NextResponse.json({ user, message: "Signed in" });
    response.cookies.set(authCookieOptions(token));
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
