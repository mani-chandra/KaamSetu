import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const UPLOAD_MAX_SIZE = 25 * 1024 * 1024;

export const UPLOAD_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export function resolveUploadMimeType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return EXT_TO_MIME[ext] || file.type;
}

function isVideoMime(mime: string): boolean {
  return mime.startsWith("video/");
}

async function saveLocal(
  file: File,
  folder: string,
  mime: string
): Promise<{ url: string; error?: string }> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop()?.toLowerCase() || (isVideoMime(mime) ? "mp4" : "jpg");
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return { url: `/uploads/${folder}/${filename}` };
  } catch (err) {
    console.error("Local upload failed:", err);
    return { url: "", error: "Failed to save file locally" };
  }
}

function cloudinarySignature(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(payload + apiSecret).digest("hex");
}

async function saveToCloudinarySigned(
  file: File,
  folder: string,
  mime: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string
): Promise<{ url: string; error?: string } | null> {
  try {
    const resourceType = isVideoMime(mime) ? "video" : mime === "application/pdf" ? "raw" : "image";
    const timestamp = Math.floor(Date.now() / 1000);
    const cloudFolder = `kaamsetu/${folder}`;
    const signature = cloudinarySignature({ folder: cloudFolder, timestamp }, apiSecret);

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", cloudFolder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      { method: "POST", body: form }
    );

    const data = (await res.json()) as { secure_url?: string; error?: { message?: string } };
    if (res.ok && data.secure_url) {
      return { url: data.secure_url };
    }
    console.error("Cloudinary signed upload failed:", data.error?.message || res.status);
    return { url: "", error: data.error?.message || "Cloudinary upload failed" };
  } catch (err) {
    console.error("Cloudinary signed upload error:", err);
    return { url: "", error: "Cloudinary upload failed" };
  }
}

async function saveToCloudinary(
  file: File,
  folder: string,
  mime: string
): Promise<{ url: string; error?: string } | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && apiKey && apiSecret) {
    return saveToCloudinarySigned(file, folder, mime, cloudName, apiKey, apiSecret);
  }

  if (!cloudName || !uploadPreset) return null;

  try {
    const resourceType = isVideoMime(mime) ? "video" : "image";
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", uploadPreset);
    form.append("folder", `kaamsetu/${folder}`);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      { method: "POST", body: form }
    );

    const data = (await res.json()) as { secure_url?: string; error?: { message?: string } };
    if (res.ok && data.secure_url) {
      return { url: data.secure_url };
    }
    console.error("Cloudinary upload failed:", data.error?.message || res.status);
    return null;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return null;
  }
}

export async function saveUploadedFile(
  file: File,
  folder: string
): Promise<{ url: string; error?: string }> {
  const mime = resolveUploadMimeType(file);

  if (!UPLOAD_ALLOWED_TYPES.includes(mime as (typeof UPLOAD_ALLOWED_TYPES)[number])) {
    return { url: "", error: "Invalid file type" };
  }
  if (file.size > UPLOAD_MAX_SIZE) {
    return { url: "", error: "File too large (max 25MB)" };
  }

  const cloudinary = await saveToCloudinary(file, folder, mime);
  if (cloudinary?.url) return cloudinary;
  if (cloudinary?.error) return cloudinary;

  return saveLocal(file, folder, mime);
}
