import { NextResponse } from "next/server";
import { mkdir, readdir, stat, unlink, writeFile } from "fs/promises";
import path from "path";

const PROFILE_LOCAL_BASENAME = "profile";
const PROFILE_FILE_PREFIX = `${PROFILE_LOCAL_BASENAME}.`;
const MIME_TO_EXTENSION = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

type ProfilePhoto = {
  fileName: string;
  mtimeMs: number;
};

const getStorageDir = () =>
  process.env.APP_STORAGE_DIR || path.join(process.cwd(), "storage");

const getUploadDir = () => path.join(getStorageDir(), "photos");

const isProfilePhotoName = (fileName: string) =>
  fileName.startsWith(PROFILE_FILE_PREFIX);

async function findLatestProfilePhoto(
  uploadDir: string,
): Promise<ProfilePhoto | null> {
  const entries = await readdir(uploadDir, { withFileTypes: true });
  const profileFiles = entries.filter(
    (entry) => entry.isFile() && isProfilePhotoName(entry.name),
  );

  if (profileFiles.length === 0) {
    return null;
  }

  const photos = await Promise.all(
    profileFiles.map(async (entry) => {
      const filePath = path.join(uploadDir, entry.name);
      const fileStat = await stat(filePath);
      return { fileName: entry.name, mtimeMs: fileStat.mtimeMs };
    }),
  );

  photos.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return photos[0] ?? null;
}

async function deleteAllProfilePhotos(uploadDir: string) {
  const entries = await readdir(uploadDir, { withFileTypes: true });
  const profileFiles = entries.filter(
    (entry) => entry.isFile() && isProfilePhotoName(entry.name),
  );

  await Promise.all(
    profileFiles.map(async (entry) => {
      const filePath = path.join(uploadDir, entry.name);
      try {
        await unlink(filePath);
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== "ENOENT") {
          throw error;
        }
      }
    }),
  );
}

export async function GET() {
  try {
    const uploadDir = getUploadDir();
    await mkdir(uploadDir, { recursive: true });
    const latestPhoto = await findLatestProfilePhoto(uploadDir);

    if (!latestPhoto) {
      return NextResponse.json({ ok: true, url: null, updatedAt: null });
    }

    return NextResponse.json({
      ok: true,
      url: `/api/photo/file/${latestPhoto.fileName}`,
      updatedAt: latestPhoto.mtimeMs,
    });
  } catch (error) {
    console.error("[Photo Read Error]", error);
    return NextResponse.json(
      { ok: false, error: "讀取頭貼時發生錯誤，請稍後再試。" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "找不到上傳的檔案。" },
        { status: 400 },
      );
    }

    const extension = MIME_TO_EXTENSION.get(file.type);
    if (!extension) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "僅支援 JPG、PNG、WEBP、GIF、AVIF 格式的圖片。",
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = getUploadDir();
    await mkdir(uploadDir, { recursive: true });

    // 每次上傳前先清除舊檔，確保只保留最新的大頭貼。
    await deleteAllProfilePhotos(uploadDir);

    const fileName = `${PROFILE_LOCAL_BASENAME}.${extension}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    const fileStat = await stat(filePath);

    // 前端可用 ?v=timestamp 來避免快取。
    return NextResponse.json({
      ok: true,
      url: `/api/photo/file/${fileName}`,
      updatedAt: fileStat.mtimeMs,
      message: "照片已上傳到伺服器。",
    });
  } catch (error) {
    console.error("[Photo Upload Error]", error);
    return NextResponse.json(
      { ok: false, error: "上傳照片時發生錯誤，請稍後再試。" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const uploadDir = getUploadDir();
    await mkdir(uploadDir, { recursive: true });
    await deleteAllProfilePhotos(uploadDir);

    return NextResponse.json({
      ok: true,
      message: "頭貼已從伺服器清除。",
    });
  } catch (error) {
    console.error("[Photo Delete Error]", error);
    return NextResponse.json(
      { ok: false, error: "清除頭貼時發生錯誤，請稍後再試。" },
      { status: 500 },
    );
  }
}
