"use client";

import { useState } from "react";
import { Camera, Video, X } from "lucide-react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/context";

async function parseUploadResponse(res: Response): Promise<{ url?: string; error?: string }> {
  const text = await res.text();
  try {
    return JSON.parse(text) as { url?: string; error?: string };
  } catch {
    return { error: text.slice(0, 120) || "Upload failed" };
  }
}

export function MediaUpload({
  photoUrls,
  videoUrls,
  onPhotosChange,
  onVideosChange,
  maxPhotos = 3,
  maxVideos = 2,
}: {
  photoUrls: string[];
  videoUrls: string[];
  onPhotosChange: (urls: string[]) => void;
  onVideosChange: (urls: string[]) => void;
  maxPhotos?: number;
  maxVideos?: number;
}) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File, type: "photo" | "video") {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await parseUploadResponse(res);
      if (!res.ok || !data.url) {
        setError(data.error || "Upload failed");
        return;
      }
      if (type === "photo") onPhotosChange([...photoUrls, data.url]);
      else onVideosChange([...videoUrls, data.url]);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {photoUrls.map((url, i) => (
          <div key={url} className="relative h-20 w-20 rounded-lg overflow-hidden border border-white/10">
            <Image src={url} alt="" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => onPhotosChange(photoUrls.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {photoUrls.length < maxPhotos && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-brand/30 bg-brand/5 hover:bg-brand/10">
            <Camera className="h-5 w-5 text-brand mb-1" />
            <span className="text-[10px] text-muted-foreground">{uploading ? t.book.uploading : t.book.addPhoto}</span>
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "photo"); e.target.value = ""; }} />
          </label>
        )}
      </div>
      {maxVideos > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {videoUrls.map((url, i) => (
            <div key={url} className="flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded">
              <Video className="h-3 w-3" />
              Video {i + 1}
              <button type="button" onClick={() => onVideosChange(videoUrls.filter((_, idx) => idx !== i))}>
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {videoUrls.length < maxVideos && (
            <label className="cursor-pointer text-xs text-brand hover:underline">
              + Add video
              <input type="file" accept="video/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "video"); e.target.value = ""; }} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
