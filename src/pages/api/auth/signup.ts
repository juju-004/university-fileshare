import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { initAuth } from "@/lib/auth";
import { getCollections } from "@/lib/connect";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, code, password } = req.body;

  if (!name || !code || !password) {
    return res.status(400).json({ error: "Please enter valid inputs" });
  }

  const scode = code.toUpperCase();
  const { users } = await getCollections();

  // Check if shortcode already exists
  const existing = await users.findOne({ shortcode: scode });
  if (existing) {
    return res.status(400).json({ error: "This university already exists" });
  }

  const hashed_password = await bcrypt.hash(password, 10);
  const userId = new ObjectId().toString();

  await users.insertOne({
    _id: userId,
    name,
    shortcode: scode,
    hashed_password,
    sentCount: 0,
    receivedCount: 0,
  });

  const lucia = await initAuth();
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  res.setHeader("Set-Cookie", sessionCookie.serialize());
  return res.status(200).end();
}
