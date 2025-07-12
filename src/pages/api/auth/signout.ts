import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { initAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const sessionId = cookies.session;

  if (!sessionId) {
    return res.status(204).end(); // No session to sign out
  }

  const lucia = await initAuth();
  await lucia.invalidateSession(sessionId);

  const expiredCookie = lucia.createBlankSessionCookie();

  res.setHeader("Set-Cookie", expiredCookie.serialize());
  return res.status(204).end();
}
