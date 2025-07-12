// pages/api/universities.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getCollections } from "@/lib/connect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { users } = await getCollections();

    const shortcodes = await users
      .find({}, { projection: { shortcode: 1, _id: 0 } })
      .toArray();

    const codes = shortcodes.map((u) => u.shortcode);

    return res.status(200).json({ shortcodes: codes });
  } catch (err) {
    console.error("Error fetching shortcodes:", err);
    return res.status(500).json({ error: "Failed to fetch shortcodes" });
  }
}
