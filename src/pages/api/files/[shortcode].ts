// pages/api/files/[shortcode].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getCollections } from "@/lib/connect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { shortcode } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!shortcode || typeof shortcode !== "string") {
    return res.status(400).json({ error: "Invalid shortcode" });
  }

  try {
    const { files } = await getCollections();

    // Fetch all files where sender or receiver matches shortcode
    const result = await files
      .find({
        $or: [
          { sender: shortcode },
          { receivers: { $regex: `\\b${shortcode}\\b`, $options: "i" } },
        ],
      })
      .sort({ uploadedAt: -1 })
      .toArray();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching files:", error);
    return res.status(500).json({ error: "Failed to fetch files" });
  }
}
