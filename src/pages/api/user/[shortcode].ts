// pages/api/user/[shortcode].ts
import { getCollections } from "@/lib/connect";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { shortcode } = req.query;
  const { users, files } = await getCollections();

  const user = await users.findOne({ shortcode });

  if (!user) return res.status(404).json({ error: "User not found" });

  const result = await files
    .aggregate([
      { $match: { sender: shortcode } },
      {
        $group: {
          _id: null,
          totalSize: { $sum: "$size" }, // sum all size fields
        },
      },
    ])
    .toArray();

  const totalSize = result[0]?.totalSize || 0;

  return res.status(200).json({
    sentCount: user.sentCount || 0,
    receivedCount: user.receivedCount || 0,
    totalSize,
  });
}
