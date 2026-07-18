import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  resolveUploadMimeType,
  saveUploadedFile,
  UPLOAD_ALLOWED_TYPES,
  UPLOAD_MAX_SIZE,
} from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mime = resolveUploadMimeType(file);
    if (!UPLOAD_ALLOWED_TYPES.includes(mime as (typeof UPLOAD_ALLOWED_TYPES)[number])) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > UPLOAD_MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }

    const result = await saveUploadedFile(file, session.user.id);
    if (result.error || !result.url) {
      return NextResponse.json({ error: result.error || "Upload failed" }, { status: 400 });
    }

    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
