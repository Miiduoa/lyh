import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // 這裡固定檔名為 profile.jpg，每次上傳都覆蓋，代表「最新的個人照片」
    const filePath = path.join(uploadDir, "profile.jpg");
    await writeFile(filePath, buffer);

    // 前端可以用 /uploads/profile.jpg?v=timestamp 來避免快取
    return NextResponse.json({
      ok: true,
      url: "/uploads/profile.jpg",
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

