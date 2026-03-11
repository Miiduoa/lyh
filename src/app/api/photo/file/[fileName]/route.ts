import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

const getStorageDir = () =>
  process.env.APP_STORAGE_DIR || path.join(process.cwd(), "storage");

const getPhotosDir = () => path.join(getStorageDir(), "photos");

const getContentType = (extension: string) => {
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileName: string }> },
) {
  try {
    const { fileName } = await context.params;
    if (!fileName.startsWith("profile.")) {
      return NextResponse.json(
        { ok: false, error: "檔名格式錯誤。" },
        { status: 400 },
      );
    }

    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { ok: false, error: "不支援的檔案格式。" },
        { status: 400 },
      );
    }

    const filePath = path.join(getPhotosDir(), fileName);
    const fileBuffer = await readFile(filePath);
    const contentType = getContentType(extension);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return NextResponse.json(
        { ok: false, error: "找不到照片。" },
        { status: 404 },
      );
    }

    console.error("[Photo File Read Error]", error);
    return NextResponse.json(
      { ok: false, error: "讀取照片時發生錯誤，請稍後再試。" },
      { status: 500 },
    );
  }
}
