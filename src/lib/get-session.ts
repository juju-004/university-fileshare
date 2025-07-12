import { cookies } from "next/headers";
import { initAuth } from "@/lib/auth";

export const getSessionUser = async () => {
  const lucia = await initAuth();
  const sessionId = lucia.readSessionCookie((await cookies()).get("session")?.value ?? "");
  const { user } = await lucia.validateSession(sessionId ?? "");

  return user; // null if not logged in
};
