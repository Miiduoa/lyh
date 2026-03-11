"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const sections = [
  { id: "about", label: "關於我" },
  { id: "goals", label: "目標與行動" },
  { id: "skills", label: "技能" },
  { id: "projects", label: "作品" },
  { id: "contact", label: "聯絡" },
];

// ===== 下面這些文字都可以直接改成你自己的 =====

const studentName = "你的名字"; // TODO：改成你的名字
const department = "靜宜大學 資訊管理學系"; // TODO：如果不是資管就改這裡

const aboutParagraphs = [
  `${studentName}，目前就讀於 ${department}。我對「資料、資料庫與網頁技術」如何結合、解決真實生活中的問題很有興趣，包含從一般資訊網站，到可以協助決策的資料分析與管理系統。`,
  "在學習與實作的過程中，我接觸過關聯式資料庫（例如：MySQL / PostgreSQL），練習過畫 ER 圖、建立資料表、撰寫基本 SQL 指令（SELECT、INSERT、UPDATE、DELETE）、JOIN 查詢，以及初步的正規化。同時也嘗試將資料庫與前端介面結合，思考如何讓資料被更有效率地管理與呈現。",
];

const goalsIntro =
  "我把自己一年的、中期三年的，以及長期十年的學習與職涯規劃分成「目標（Goal）」與「行動目標（Objective）」。目標是我想達到的大方向與成果，好像我想前往的目的地；行動目標則是具體、可衡量的短期步驟，好像帶著我一步步前進的地圖。";

const oneYearGoal =
  "建立資料庫管理與網頁開發的扎實基礎，確實掌握重要觀念與實作能力。";
const oneYearObjectives = [
  "完成所有與資料庫與程式相關的練習與小專題，並且保留清楚的文件與說明。",
  "完成至少一個有連接資料庫的簡單網站或小系統，能在本機或雲端正常運作，並整理成作品集的一部分。",
  "至少參加一場與資料庫、後端或資料相關的講座、工作坊或線上課程，擴展視野。",
];

const threeYearGoal =
  "成為具備實務經驗的初階工程師或資料相關人員，擁有可以對外展示的作品與實習經驗。";
const threeYearObjectives = [
  "完成至少一次與軟體開發、資料分析或資訊系統相關的實習或工讀經驗。",
  "累積 3–5 個可以放在作品集中的專案，內容包含資料庫設計、SQL 操作與基本後端邏輯。",
  "取得至少一張與資料、SQL 或雲端基礎相關的證照，作為自己能力的里程碑。",
];

const tenYearGoal =
  "成長為能設計資料導向系統、並能協助他人學習的資深工程師或技術人才。";
const tenYearObjectives = [
  "累積參與或主導中大型資料庫或資料平台系統的經驗，能思考整體架構與長期維護。",
  "在團隊中擔任重要的技術角色，與同事分享資料建模、效能調校與資料治理的最佳實務。",
  "持續透過進修課程、閱讀與參與技術社群，讓自己的知識隨著產業變化而更新，不斷精進。",
];

const EDIT_MODE_STORAGE_KEY = "dbm-edit-mode";
const CONTENT_SYNC_STORAGE_KEY = "dbm-profile-content";
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const CONTENT_SAVE_DEBOUNCE_MS = 800;
const PROFILE_EDITABLE_SELECTOR = "[data-profile-editable='1']";
const ALLOWED_PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const withPhotoVersion = (url: string, version?: string | number | null) => {
  const fallbackToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const token = version ?? fallbackToken;
  return `${url}${url.includes("?") ? "&" : "?"}v=${token}`;
};

type ResultTone = "success" | "error";
type PhotoApiResponse = {
  ok?: boolean;
  url?: string | null;
  updatedAt?: number | null;
  message?: string;
  error?: string;
};
type ProfileContentApiResponse = {
  ok?: boolean;
  values?: string[] | null;
  updatedAt?: number | null;
  message?: string;
  error?: string;
};

export default function Home() {
  const [editMode, setEditMode] = useState(false);
  const [editModeReady, setEditModeReady] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const saveContentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoPending, setPhotoPending] = useState(false);
  const [photoResult, setPhotoResult] = useState<string | null>(null);
  const [photoResultTone, setPhotoResultTone] = useState<ResultTone | null>(
    null,
  );
  const [contentValues, setContentValues] = useState<string[] | null>(null);
  const [contentSyncPending, setContentSyncPending] = useState(false);
  const [contentSyncResult, setContentSyncResult] = useState<string | null>(
    null,
  );
  const [contentSyncTone, setContentSyncTone] = useState<ResultTone | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [sendResultTone, setSendResultTone] = useState<ResultTone | null>(
    null,
  );
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedEditMode = window.localStorage.getItem(EDIT_MODE_STORAGE_KEY);
    if (savedEditMode === "1") {
      setEditMode(true);
    }
    setEditModeReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !editModeReady) return;
    window.localStorage.setItem(EDIT_MODE_STORAGE_KEY, editMode ? "1" : "0");
  }, [editMode, editModeReady]);

  const collectEditableValues = () => {
    const root = mainRef.current;
    if (!root) return [] as string[];
    return Array.from(
      root.querySelectorAll<HTMLElement>(PROFILE_EDITABLE_SELECTOR),
    ).map((node) => node.textContent ?? "");
  };

  const applyEditableValues = (values: string[]) => {
    const root = mainRef.current;
    if (!root) return;

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(PROFILE_EDITABLE_SELECTOR),
    );
    nodes.forEach((node, index) => {
      const value = values[index];
      if (typeof value !== "string") return;
      if ((node.textContent ?? "") === value) return;
      node.textContent = value;
    });
  };

  const saveEditableValues = async () => {
    const values = collectEditableValues();
    if (values.length === 0) return;

    setContentSyncPending(true);
    setContentSyncResult(null);
    setContentSyncTone(null);

    try {
      const response = await fetch("/api/profile-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values }),
      });
      const json = (await response.json()) as ProfileContentApiResponse;

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "同步內容時發生錯誤，請稍後再試。");
      }

      setContentValues(values);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CONTENT_SYNC_STORAGE_KEY, JSON.stringify(values));
      }
      setContentSyncTone("success");
      setContentSyncResult(json.message || "網站內容已同步。");
    } catch (error) {
      setContentSyncTone("error");
      setContentSyncResult(
        error instanceof Error
          ? error.message
          : "同步內容時發生錯誤，請稍後再試。",
      );
    } finally {
      setContentSyncPending(false);
    }
  };

  const queueEditableSync = () => {
    if (!editMode) return;
    if (saveContentTimerRef.current) {
      clearTimeout(saveContentTimerRef.current);
    }
    saveContentTimerRef.current = setTimeout(() => {
      void saveEditableValues();
    }, CONTENT_SAVE_DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (saveContentTimerRef.current) {
        clearTimeout(saveContentTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const restoreContent = async () => {
      try {
        const response = await fetch("/api/profile-content", {
          cache: "no-store",
        });
        const json = (await response.json()) as ProfileContentApiResponse;
        if (response.ok && json.ok && Array.isArray(json.values)) {
          if (cancelled) return;
          setContentValues(json.values);
          window.localStorage.setItem(
            CONTENT_SYNC_STORAGE_KEY,
            JSON.stringify(json.values),
          );
          return;
        }
      } catch {
        // API 失敗時，退回 localStorage 快取。
      }

      const cached = window.localStorage.getItem(CONTENT_SYNC_STORAGE_KEY);
      if (!cached || cancelled) return;
      try {
        const parsed = JSON.parse(cached) as unknown;
        if (Array.isArray(parsed)) {
          setContentValues(
            parsed.map((item) => (typeof item === "string" ? item : "")),
          );
        }
      } catch {
        // 快取解析失敗時忽略。
      }
    };

    void restoreContent();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!contentValues) return;
    applyEditableValues(contentValues);
  }, [contentValues, editMode, exportMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    window.localStorage.removeItem("dbm-profile-photo");

    const restorePhoto = async () => {
      try {
        const response = await fetch("/api/photo", { cache: "no-store" });
        const json = (await response.json()) as PhotoApiResponse;
        if (response.ok && json.ok) {
          if (!json.url) {
            if (!cancelled) {
              setPhotoDataUrl(null);
            }
            return;
          }

          if (cancelled) return;
          setPhotoDataUrl(withPhotoVersion(json.url, json.updatedAt));
          return;
        }
      } catch {
        // 讀取 API 失敗時，避免使用舊快取造成顯示錯誤頭貼。
      }

      if (!cancelled) {
        setPhotoDataUrl(null);
        setPhotoResultTone("error");
        setPhotoResult("目前無法讀取頭貼，請重新整理或重新上傳。");
      }
    };

    void restorePhoto();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PHOTO_MIME_TYPES.has(file.type)) {
      setPhotoResultTone("error");
      setPhotoResult("請上傳 JPG、PNG、WEBP、GIF 或 AVIF 格式。");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setPhotoResultTone("error");
      setPhotoResult("圖片大小需小於 5MB，請壓縮後再上傳。");
      event.target.value = "";
      return;
    }

    const previousPhotoUrl = photoDataUrl;
    const previewUrl = URL.createObjectURL(file);

    setPhotoPending(true);
    setPhotoResult(null);
    setPhotoResultTone(null);
    setPhotoDataUrl(previewUrl);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/photo", {
        method: "POST",
        body: formData,
      });

      const json = (await response.json()) as PhotoApiResponse;

      if (!response.ok || !json.ok || !json.url) {
        throw new Error(json.error || "上傳照片時發生錯誤，請稍後再試。");
      }

      setPhotoDataUrl(withPhotoVersion(json.url, json.updatedAt));
      setPhotoResultTone("success");
      setPhotoResult(json.message || "照片已上傳到伺服器。");
    } catch (error) {
      setPhotoDataUrl(previousPhotoUrl);
      setPhotoResultTone("error");
      setPhotoResult(
        error instanceof Error
          ? error.message
          : "上傳照片時發生錯誤，請稍後再試。",
      );
    } finally {
      URL.revokeObjectURL(previewUrl);
      setPhotoPending(false);
      event.target.value = "";
    }
  };

  const handlePhotoClear = async () => {
    const previousPhotoUrl = photoDataUrl;

    setPhotoPending(true);
    setPhotoResult(null);
    setPhotoResultTone(null);
    setPhotoDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const response = await fetch("/api/photo", {
        method: "DELETE",
      });
      const json = (await response.json()) as PhotoApiResponse;

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "清除頭貼時發生錯誤，請稍後再試。");
      }

      setPhotoResultTone("success");
      setPhotoResult(json.message || "頭貼已清除。");
    } catch (error) {
      setPhotoResultTone("error");
      setPhotoDataUrl(previousPhotoUrl);
      setPhotoResult(
        error instanceof Error
          ? error.message
          : "清除頭貼時發生錯誤，請稍後再試。",
      );
    } finally {
      setPhotoPending(false);
    }
  };

  const rootClasses = [
    "min-h-screen",
    "bg-zinc-950 text-zinc-100",
    editMode ? "editable-mode" : "",
    exportMode ? "export-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handlePdfExport = () => {
    if (typeof window === "undefined") return;
    // 進入輸出模式並關閉編輯效果，再呼叫瀏覽器的列印對話框（可直接存成 PDF）
    setExportMode(true);
    if (editMode) {
      setEditMode(false);
    }
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const toggleEditMode = () => {
    setExportMode(false);
    setEditMode((prev) => !prev);
  };

  const handleMainInputCapture = (event: React.FormEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (!target.isContentEditable) return;
    queueEditableSync();
  };

  return (
    <div className={rootClasses}>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-10 sm:py-12">
        <header className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-4 sm:pb-6">
          <div className="flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-zinc-400 uppercase">
            <span className="h-[1px] w-6 bg-zinc-500" />
            <span>PORTFOLIO</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden gap-6 text-xs font-medium text-zinc-400 sm:flex">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="transition-colors hover:text-zinc-100"
                >
                  {section.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="screen-only rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-medium tracking-[0.16em] text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800"
                aria-pressed={exportMode}
                onClick={() => {
                  // 輸出模式下，自動關閉編輯效果
                  setExportMode((prev) => {
                    const next = !prev;
                    if (next) {
                      if (editMode) {
                        setEditMode(false);
                      }
                    }
                    return next;
                  });
                }}
              >
                {exportMode ? "離開輸出模式" : "輸出模式"}
              </button>
              <button
                type="button"
                className="editor-only rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-medium tracking-[0.16em] text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800"
                onClick={handlePdfExport}
              >
                下載 PDF
              </button>
              <button
                type="button"
                className="editor-only rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-medium tracking-[0.16em] text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800"
                aria-pressed={editMode}
                onClick={toggleEditMode}
              >
                {editMode ? "關閉編輯模式" : "開啟編輯模式"}
              </button>
            </div>
          </div>
        </header>
        {editMode && (
          <div className="editor-only mt-3 flex items-center gap-2 text-[11px]">
            <span className="text-zinc-500">內容同步：</span>
            <span
              className={
                contentSyncPending
                  ? "text-zinc-300"
                  : contentSyncTone === "error"
                    ? "text-rose-300"
                    : contentSyncTone === "success"
                      ? "text-emerald-300"
                      : "text-zinc-400"
              }
              role="status"
              aria-live="polite"
            >
              {contentSyncPending
                ? "同步中…"
                : contentSyncResult || "編輯內容會自動同步到伺服器（另一台裝置重新整理可看到最新內容）。"}
            </span>
          </div>
        )}

        <nav
          className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 text-[11px] font-medium text-zinc-400 sm:hidden"
          aria-label="手機章節導覽"
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 transition hover:border-zinc-600 hover:text-zinc-100"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <main
          ref={mainRef}
          className="flex flex-1 flex-col gap-16 py-10 sm:gap-20 sm:py-14"
          onInputCapture={handleMainInputCapture}
          onBlurCapture={handleMainInputCapture}
        >
          <section
            id="hero"
            className="grid gap-10 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-end"
          >
            <div className="space-y-6">
              <p
                className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500"
                contentEditable={editMode}
                data-profile-editable="1"
                suppressContentEditableWarning
              >
                {studentName} / 個人網站
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl md:text-5xl">
                <span
                  contentEditable={editMode}
                data-profile-editable="1"
                  suppressContentEditableWarning
                >
                  {studentName} 的個人網站
                </span>
                <span className="block text-zinc-400">
                  <span
                    contentEditable={editMode}
                data-profile-editable="1"
                    suppressContentEditableWarning
                  >
                    紀錄學習、成長與作品
                  </span>
                </span>
              </h1>
              <p
                className="max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base"
                contentEditable={editMode}
                data-profile-editable="1"
                suppressContentEditableWarning
              >
                這個網站主要用來整理我的個人簡介、學習經歷與代表性作品。在這裡可以看到我的背景、
                技能與不同階段完成的專案，同時也留下聯絡方式，方便對我有興趣的人進一步交流。
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#projects"
                  className="rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2 text-xs font-medium tracking-wide text-zinc-50 transition hover:border-zinc-500 hover:bg-zinc-800"
                >
                  查看作品
                </a>
                <a
                  href="#contact"
                  className="rounded-full px-5 py-2 text-xs font-medium tracking-wide text-zinc-400 transition hover:text-zinc-100"
                >
                  聯絡我
                </a>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-[0_0_120px_rgba(0,0,0,0.7)]">
              <div className="flex items-center gap-5">
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-900/80 text-center">
                  {photoDataUrl ? (
                    <Image
                      src={photoDataUrl}
                      alt={studentName}
                      fill
                      sizes="112px"
                      className="object-cover"
                      unoptimized
                      onError={() => setPhotoDataUrl(null)}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center px-3 text-[11px] leading-relaxed text-zinc-500">
                      尚未設定大頭貼，
                      <br />
                      請使用右下角按鈕上傳。
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-xs text-zinc-400">
                  <p
                    className="font-medium text-zinc-200"
                    contentEditable={editMode}
                data-profile-editable="1"
                    suppressContentEditableWarning
                  >
                    {studentName} / 資訊相關領域
                  </p>
                  <p
                    contentEditable={editMode}
                data-profile-editable="1"
                    suppressContentEditableWarning
                  >
                    這是一個整理個人簡介、學習歷程與作品的網站，透過文字與介面呈現自己在資料、
                    網頁與相關技術上的興趣與成長軌跡。
                  </p>
                </div>
              </div>
              {editMode && (
                <div className="editor-only flex items-center justify-between gap-3 border-t border-zinc-800 pt-3 text-[11px] text-zinc-400">
                  <div>
                    <p className="uppercase tracking-[0.18em] text-zinc-500">
                      編輯照片（上傳到伺服器）
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      支援 JPG、PNG、WEBP、GIF、AVIF；上傳後會覆蓋舊頭貼，所有人重新整理都會看到最新照片。
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[10px] font-medium tracking-[0.14em] text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={photoPending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPending ? "處理中…" : "選擇照片…"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-zinc-800 px-3 py-1.5 text-[10px] tracking-[0.14em] text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={photoPending}
                      onClick={handlePhotoClear}
                    >
                      清除頭貼
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                </div>
              )}
              {photoResult && (
                <p
                  className={`text-[11px] ${
                    photoResultTone === "error"
                      ? "text-rose-300"
                      : "text-emerald-300"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {photoResult}
                </p>
              )}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>目前狀態</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-700/40 bg-emerald-900/30 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    接受新挑戰
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-4 text-xs text-zinc-400">
                  <div className="space-y-1">
                    <dt className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                      專長領域
                    </dt>
                    <dd>資訊管理 / Web & Database 基礎</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                      所在城市
                    </dt>
                    <dd>Taichung, Taiwan</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <section
            id="about"
            className="grid gap-8 border-t border-zinc-800 pt-10 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]"
          >
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="font-medium uppercase tracking-[0.25em] text-zinc-500">
                ABOUT
              </p>
              <p
                contentEditable={editMode}
                data-profile-editable="1"
                suppressContentEditableWarning
              >
                關於我的背景、興趣與目前的學習與發展方向。
              </p>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
              {aboutParagraphs.map((text, index) => (
                <p
                  key={index}
                  contentEditable={editMode}
                data-profile-editable="1"
                  suppressContentEditableWarning
                >
                  {text}
                </p>
              ))}
            </div>
          </section>

          <section
            id="goals"
            className="grid gap-8 border-t border-zinc-800 pt-10 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]"
          >
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="font-medium uppercase tracking-[0.25em] text-zinc-500">
                GOALS &amp; OBJECTIVES
              </p>
              <p
                contentEditable={editMode}
                data-profile-editable="1"
                suppressContentEditableWarning
              >
                目標是長期的「目的地」，行動目標則是帶我一步步前進的「地圖」。
              </p>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
              <p
                contentEditable={editMode}
                data-profile-editable="1"
                suppressContentEditableWarning
              >
                {goalsIntro}
              </p>
              <div className="space-y-4">
                <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-zinc-500">
                    ONE-YEAR（短期 1 年）
                  </p>
                  <p className="text-zinc-200">
                    <span
                      contentEditable={editMode}
                data-profile-editable="1"
                      suppressContentEditableWarning
                    >
                      Goal（目標）：{oneYearGoal}
                    </span>
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-zinc-400">
                    {oneYearObjectives.map((obj, index) => (
                      <li
                        key={index}
                        contentEditable={editMode}
                data-profile-editable="1"
                        suppressContentEditableWarning
                      >
                        Objective（行動目標）：{obj}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-zinc-500">
                    THREE-YEAR（中期 3 年）
                  </p>
                  <p className="text-zinc-200">
                    <span
                      contentEditable={editMode}
                data-profile-editable="1"
                      suppressContentEditableWarning
                    >
                      Goal（目標）：{threeYearGoal}
                    </span>
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-zinc-400">
                    {threeYearObjectives.map((obj, index) => (
                      <li
                        key={index}
                        contentEditable={editMode}
                data-profile-editable="1"
                        suppressContentEditableWarning
                      >
                        Objective（行動目標）：{obj}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-zinc-500">
                    TEN-YEAR（長期 10 年）
                  </p>
                  <p className="text-zinc-200">
                    <span
                      contentEditable={editMode}
                data-profile-editable="1"
                      suppressContentEditableWarning
                    >
                      Goal（目標）：{tenYearGoal}
                    </span>
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-zinc-400">
                    {tenYearObjectives.map((obj, index) => (
                      <li
                        key={index}
                        contentEditable={editMode}
                data-profile-editable="1"
                        suppressContentEditableWarning
                      >
                        Objective（行動目標）：{obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section
            id="skills"
            className="grid gap-8 border-t border-zinc-800 pt-10 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]"
          >
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="font-medium uppercase tracking-[0.25em] text-zinc-500">
                SKILLS
              </p>
              <p
                contentEditable={editMode}
                data-profile-editable="1"
                suppressContentEditableWarning
              >
                列出你的核心技能與工具。
              </p>
            </div>
            <div className="grid gap-4 text-sm text-zinc-200 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                <p className="text-xs font-medium tracking-[0.18em] text-zinc-500">
                  前端 / 工程
                </p>
                <p
                  contentEditable={editMode}
                data-profile-editable="1"
                  suppressContentEditableWarning
                >
                  TypeScript、React、Next.js、Tailwind CSS、REST API
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                <p className="text-xs font-medium tracking-[0.18em] text-zinc-500">
                  設計 / 產品
                </p>
                <p
                  contentEditable={editMode}
                data-profile-editable="1"
                  suppressContentEditableWarning
                >
                  UI 版型、設計系統、原型製作、互動流程規劃
                </p>
              </div>
            </div>
          </section>

          <section
            id="projects"
            className="grid gap-8 border-t border-zinc-800 pt-10 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]"
          >
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="font-medium uppercase tracking-[0.25em] text-zinc-500">
                PROJECTS
              </p>
              <p
                contentEditable={editMode}
                data-profile-editable="1"
                suppressContentEditableWarning
              >
                精選 2–4 個代表性的作品。
              </p>
            </div>
            <div className="grid gap-4">
              <article className="group flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 transition hover:border-zinc-600 sm:p-5">
                <header className="flex items-center justify-between gap-3">
                  <h3
                    className="text-sm font-medium text-zinc-50"
                    contentEditable={editMode}
                data-profile-editable="1"
                    suppressContentEditableWarning
                  >
                    作品名稱範例 / Project A
                  </h3>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    2024
                  </span>
                </header>
                <p
                  className="text-xs leading-relaxed text-zinc-400"
                  contentEditable={editMode}
                data-profile-editable="1"
                  suppressContentEditableWarning
                >
                  簡短描述這個專案的目標、你負責的部分，以及使用到的技術或設計重點。
                  盡量用非技術背景的人也看得懂的語言來說明。
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400">
                  <span className="rounded-full border border-zinc-800 px-3 py-1">
                    Next.js
                  </span>
                  <span className="rounded-full border border-zinc-800 px-3 py-1">
                    UI / UX
                  </span>
                </div>
              </article>

              <article className="group flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 transition hover:border-zinc-600 sm:p-5">
                <header className="flex items-center justify-between gap-3">
                  <h3
                    className="text-sm font-medium text-zinc-50"
                    contentEditable={editMode}
                data-profile-editable="1"
                    suppressContentEditableWarning
                  >
                    作品名稱範例 / Project B
                  </h3>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    2023
                  </span>
                </header>
                <p
                  className="text-xs leading-relaxed text-zinc-400"
                  contentEditable={editMode}
                data-profile-editable="1"
                  suppressContentEditableWarning
                >
                  再放一個你滿意的作品，可以是商業案、個人實驗或是學校專題，
                  重點放在你所創造的價值與成果。
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400">
                  <span className="rounded-full border border-zinc-800 px-3 py-1">
                    前端開發
                  </span>
                  <span className="rounded-full border border-zinc-800 px-3 py-1">
                    品牌視覺
                  </span>
                </div>
              </article>
            </div>
          </section>

          <section
            id="contact"
            className="grid gap-8 border-t border-zinc-800 pt-10 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]"
          >
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="font-medium uppercase tracking-[0.25em] text-zinc-500">
                CONTACT
              </p>
              <p
                contentEditable={editMode}
                data-profile-editable="1"
                suppressContentEditableWarning
              >
                讓別人知道如何找到你。
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2 text-sm text-zinc-300">
                <p
                  contentEditable={editMode}
                data-profile-editable="1"
                  suppressContentEditableWarning
                >
                  想合作、聊天或是有任何問題，都歡迎直接寫信給我，
                  或透過社群媒體私訊聯絡。
                </p>
              </div>
              <form
                className="space-y-3 text-sm text-zinc-200"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setSending(true);
                  setSendResult(null);
                  setSendResultTone(null);
                  try {
                    const res = await fetch("/api/contact", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(contactForm),
                    });
                    const json = (await res.json()) as {
                      ok?: boolean;
                      message?: string;
                      error?: string;
                    };
                    if (!res.ok || !json.ok) {
                      setSendResultTone("error");
                      setSendResult(json.error || "送出失敗，請稍後再試。");
                    } else {
                      setSendResultTone("success");
                      setSendResult(json.message || "已成功送出！");
                      setContactForm({ name: "", email: "", message: "" });
                    }
                  } catch {
                    setSendResultTone("error");
                    setSendResult("送出時發生錯誤，請檢查網路或稍後再試。");
                  } finally {
                    setSending(false);
                  }
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs text-zinc-400">
                    <span>姓名 *</span>
                    <input
                      type="text"
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                      value={contactForm.name}
                      disabled={sending}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-zinc-400">
                    <span>Email *</span>
                    <input
                      type="email"
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                      value={contactForm.email}
                      disabled={sending}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1 text-xs text-zinc-400">
                  <span>訊息內容 *</span>
                  <textarea
                    className="min-h-[96px] rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                    value={contactForm.message}
                    disabled={sending}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-full border border-zinc-700 bg-zinc-100 px-4 py-2 text-xs font-medium tracking-[0.18em] text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={sending}
                  >
                    {sending ? "送出中…" : "送出訊息"}
                  </button>
                  {sendResult && (
                    <p
                      className={`text-xs ${
                        sendResultTone === "error"
                          ? "text-rose-300"
                          : "text-emerald-300"
                      }`}
                      role="status"
                      aria-live="polite"
                    >
                      {sendResult}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </section>
        </main>

        <footer className="border-t border-zinc-900 pt-4 text-[11px] text-zinc-500">
          <p>
            © {new Date().getFullYear()} YOUR NAME. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
