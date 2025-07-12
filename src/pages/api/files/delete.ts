// pages/api/files/delete.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getCollections } from "@/lib/connect";
import { v2 as cloudinary } from "cloudinary";

// Setup Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ error: "Missing public_id" });
  }

  try {
    const { files } = await getCollections();

    // 1. Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id, {
      resource_type: "raw", // because it's a zip
    });

    // 2. Remove from database
    await files.deleteOne({ public_id });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete failed:", err);
    return res.status(500).json({ error: "Failed to delete file" });
  }
}
