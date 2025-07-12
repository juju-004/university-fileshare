import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";
import JSZip from "jszip";
import { getCollections } from "@/lib/connect";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Disable body parsing (formidable handles it)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File parsing error" });

    const fileList = Array.isArray(files.files) ? files.files : [files.files];
    if (!fields.sender || !fields.receivers || fileList.length === 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const sender = fields.sender[0];
    const receivers = fields.receivers[0];
    const zippedFiles: string[] = [];

    try {
      const zip = new JSZip();

      for (const file of fileList) {
        if (!file || !file.filepath) continue;

        const buffer = await fs.readFile(file.filepath);
        const filename = file.originalFilename || "file";
        zip.file(filename, buffer);
        zippedFiles.push(filename);
      }

      const zipContent = await zip.generateAsync({ type: "nodebuffer" });
      const zipSizeInBytes = zipContent.length;

      // ✅ Use OS temp directory (safe for production)
      const tempPath = os.tmpdir();
      const zipName = "fileshare-" + Date.now() + ".zip";
      const zipPath = path.join(tempPath, zipName);

      await fs.writeFile(zipPath, zipContent);

      // Upload to Cloudinary
      const upload = await cloudinary.uploader.upload(zipPath, {
        resource_type: "raw",
        folder: "fileshare-zips",
        public_id: zipName.replace(".zip", ""),
      });

      await fs.unlink(zipPath); // cleanup

      const collection = await getCollections();
      await collection.files.insertOne({
        url: upload.secure_url,
        public_id: upload.public_id,
        originalName: zipName,
        uploadedAt: new Date(),
        sender,
        size: zipSizeInBytes,
        receivers,
        zippedFiles,
      });

      // Update sender's sentCount
      await collection.users.updateOne(
        { shortcode: sender },
        { $inc: { sentCount: 1 } }
      );

      // Update each receiver's receivedCount
      const receiverList = receivers.split(",").map((r) => r.trim());
      await Promise.all(
        receiverList.map((code) =>
          collection.users.updateOne(
            { shortcode: code },
            { $inc: { receivedCount: 1 } }
          )
        )
      );

      return res.status(200).json({ success: true, url: upload.secure_url });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}
