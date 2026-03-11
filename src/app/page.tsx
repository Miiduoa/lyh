"use client";

/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */

import { useRef, useState } from "react";

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

export default function Home() {
  const [editMode, setEditMode] = useState(true);
  const [exportMode, setExportMode] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [photoError, setPhotoError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/photo", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        // 這裡不用特別顯示錯誤 UI，使用者可以從畫面沒有變化感覺出來
        // 如有需要，可加上獨立的錯誤訊息區塊
        // console.error(json.error || "上傳失敗");
        return;
      }
      // 改變 version 讓 <img> 的查詢參數改變，避免快取看不到新圖
      setPhotoVersion(Date.now());
    } catch {
      // console.error("上傳照片時發生錯誤");
    } finally {
      // 清空 input 的值，才可以再選同一張圖觸發 change
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

  return (
    <div className={rootClasses}>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-10 sm:py-12">
        <header className="flex items-center justify-between border-b border-zinc-800 pb-4 sm:pb-6">
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="editor-only rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-medium tracking-[0.16em] text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800"
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
                onClick={() => setEditMode((prev) => !prev)}
              >
                {editMode ? "關閉編輯模式" : "開啟編輯模式"}
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-16 py-10 sm:gap-20 sm:py-14">
          <section
            id="hero"
            className="grid gap-10 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-end"
          >
            <div className="space-y-6">
              <p
                className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500"
                contentEditable={editMode}
                suppressContentEditableWarning
              >
                {studentName} / 個人網站
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl md:text-5xl">
                <span
                  contentEditable={editMode}
                  suppressContentEditableWarning
                >
                  {studentName} 的個人網站
                </span>
                <span className="block text-zinc-400">
                  <span
                    contentEditable={editMode}
                    suppressContentEditableWarning
                  >
                    紀錄學習、成長與作品
                  </span>
                </span>
              </h1>
              <p
                className="max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base"
                contentEditable={editMode}
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
                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-900/80 text-center">
                  {photoError ? (
                    <div className="flex h-full w-full flex-col items-center justify-center px-3 text-[11px] leading-relaxed text-zinc-500">
                      尚未設定大頭貼，
                      <br />
                      請使用右下角按鈕上傳。
                    </div>
                  ) : (
                    <img
                      src={`/uploads/profile.jpg${photoVersion ? `?v=${photoVersion}` : ""}`}
                      alt={studentName}
                      className="h-full w-full object-cover"
                      onError={() => setPhotoError(true)}
                    />
                  )}
                </div>
                <div className="space-y-2 text-xs text-zinc-400">
                  <p
                    className="font-medium text-zinc-200"
                    contentEditable={editMode}
                    suppressContentEditableWarning
                  >
                    {studentName} / 資訊相關領域
                  </p>
                  <p
                    contentEditable={editMode}
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
                      上傳後會覆蓋伺服器上的 profile.jpg，所有人重新整理頁面都會看到最新的照片。
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[10px] font-medium tracking-[0.14em] text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      選擇照片…
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
                suppressContentEditableWarning
              >
                目標是長期的「目的地」，行動目標則是帶我一步步前進的「地圖」。
              </p>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
              <p
                contentEditable={editMode}
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
                suppressContentEditableWarning
              >
                讓別人知道如何找到你。
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2 text-sm text-zinc-300">
                <p
                  contentEditable={editMode}
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
                      setSendResult(json.error || "送出失敗，請稍後再試。");
                    } else {
                      setSendResult(json.message || "已成功送出！");
                      setContactForm({ name: "", email: "", message: "" });
                    }
                  } catch {
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
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-zinc-500"
                      value={contactForm.name}
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
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-zinc-500"
                      value={contactForm.email}
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
                    className="min-h-[96px] rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-zinc-500"
                    value={contactForm.message}
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
                    <p className="text-xs text-zinc-400">{sendResult}</p>
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
