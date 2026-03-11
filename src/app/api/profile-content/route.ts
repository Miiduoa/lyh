import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

type ProfileContentPayload = {
  values: string[];
  updatedAt: number;
};

const getStorageDir = () =>
  process.env.APP_STORAGE_DIR || path.join(process.cwd(), "storage");

const getDataFilePath = () => path.join(getStorageDir(), "profile-content.json");

async function readProfileContent(): Promise<ProfileContentPayload | null> {
  const filePath = getDataFilePath();
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ProfileContentPayload>;
    if (!Array.isArray(parsed.values)) {
      return null;
    }
    return {
      values: parsed.values.map((item) =>
        typeof item === "string" ? item : "",
      ),
      updatedAt:
        typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function GET() {
  try {
    const profileContent = await readProfileContent();
    return NextResponse.json({
      ok: true,
      values: profileContent?.values ?? null,
      updatedAt: profileContent?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("[Profile Content Read Error]", error);
    return NextResponse.json(
      { ok: false, error: "讀取網站內容時發生錯誤，請稍後再試。" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { values?: unknown };
    if (!Array.isArray(body.values)) {
      return NextResponse.json(
        { ok: false, error: "資料格式錯誤，無法儲存。" },
        { status: 400 },
      );
    }

    if (body.values.length > 400) {
      return NextResponse.json(
        { ok: false, error: "內容欄位過多，請稍後再試。" },
        { status: 400 },
      );
    }

    const normalizedValues = body.values.map((item) =>
      typeof item === "string" ? item : "",
    );
    const payload: ProfileContentPayload = {
      values: normalizedValues,
      updatedAt: Date.now(),
    };

    const filePath = getDataFilePath();
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");

    return NextResponse.json({
      ok: true,
      updatedAt: payload.updatedAt,
      message: "內容已同步到伺服器。",
    });
  } catch (error) {
    console.error("[Profile Content Write Error]", error);
    return NextResponse.json(
      { ok: false, error: "儲存網站內容時發生錯誤，請稍後再試。" },
      { status: 500 },
    );
  }
}
