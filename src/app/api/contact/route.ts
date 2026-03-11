import { NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(request: Request) {
  const data = (await request.json()) as ContactPayload;
  const name = data.name?.trim();
  const email = data.email?.trim();
  const message = data.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "請填寫姓名、Email 與訊息內容。" },
      { status: 400 },
    );
  }

  // 在真實專案中，這裡可以：
  // - 寫入資料庫
  // - 發送 Email
  // - 呼叫外部 API
  // 這裡為課堂作業示範，只是將資料印在伺服器端 log。
  console.log("[Contact] 新留言：", {
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    message: "已成功送出，感謝你的訊息！",
  });
}

