import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookieOnResponse,
} from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/auth/get-user";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, fullName } = parsed.data;

    if (findUserByEmail(email)) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = randomUUID();
    const db = getDb();

    db.prepare(
      `INSERT INTO users (id, email, password_hash, full_name, role)
       VALUES (?, ?, ?, ?, 'student')`
    ).run(userId, email.toLowerCase(), passwordHash, fullName);

    const sessionPayload = {
      sub: userId,
      email: email.toLowerCase(),
      role: "student" as const,
      fullName,
    };

    const token = await createSessionToken(sessionPayload);
    const response = NextResponse.json({
      user: {
        id: userId,
        email: email.toLowerCase(),
        full_name: fullName,
        role: "student",
      },
    });
    setSessionCookieOnResponse(response, sessionPayload, token);

    db.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
    ).run(randomUUID(), userId);

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
