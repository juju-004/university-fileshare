import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  try {
    await client.connect();
    const db = client.db();
    const file = await db.collection("files").findOne({ code });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    return res.status(200).json({ url: file.url, name: file.originalName });
  } catch (err) {
    console.error("Download error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
