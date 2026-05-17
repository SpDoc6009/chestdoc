import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  Search,
  ShieldCheck,
  Stethoscope
} from "lucide-react";

export const metadata = {
  title: "視覺風格預覽"
};

const guideQuestions = [
  { title: "我想先了解疾病", count: 12, href: "/education", color: "bg-[#dce6de] text-[#2b4c40] border-[#c4d6c3]" },
  { title: "我想知道檢查怎麼做", count: 7, href: "/search?q=檢查&type=education", color: "bg-[#d9e7ea] text-[#5b778e] border-[#bfd3d8]" },
  { title: "我想查治療與藥物", count: 9, href: "/search?q=治療&type=education", color: "bg-[#f5d0cc] text-[#8e5551] border-[#e9bcb7]" },
  { title: "我想看重症與呼吸照護", count: 6, href: "/articles", color: "bg-[#fdd8bb] text-[#8a5c38] border-[#efc5a3]" }
];

const chapterCards = [
  {
    title: "胸腔疾病圖文解說",
    description: "用圖文筆記整理 COPD、氣喘、肺炎、肋膜疾病與間質性肺病的核心概念。",
    href: "/articles",
    icon: BookOpen,
    image: "/images/article-visual-hero.png",
    accent: "from-[#5b778e]/72 to-[#5b778e]/20"
  },
  {
    title: "病人衛教園區",
    description: "把檢查、治療、居家照護與回診警訊寫成病人與家屬比較容易吸收的版本。",
    href: "/education",
    icon: HeartPulse,
    image: "/images/patient-education-hero.png",
    accent: "from-[#e79e90]/72 to-[#e79e90]/18"
  },
  {
    title: "醫學新知筆記",
    description: "收藏胸腔醫學新知、臨床研究摘要與 AI 輔助整理的互動式 HTML 報告。",
    href: "/reports",
    icon: Activity,
    image: "/images/medical-news-hero.png",
    accent: "from-[#2b4c40]/76 to-[#2b4c40]/18"
  },
  {
    title: "PDF 指南文件庫",
    description: "集中管理臨床指南、速查表、教學講義與重要文件，方便快速閱讀。",
    href: "/pdfs",
    icon: FileText,
    image: "/images/teaching-hero.png",
    accent: "from-[#28675b]/74 to-[#28675b]/18"
  }
];

const principles = [
  "先讓病人知道下一步",
  "把複雜資訊拆成小段",
  "重要警訊要醒目但不恐嚇",
  "醫療決策保留專業判斷"
];

const pageSections = [
  { id: "quick-search", label: "快速搜尋" },
  { id: "chapter-entry", label: "章節入口" },
  { id: "reading-principles", label: "閱讀原則" },
  { id: "visual-sections", label: "圖片情緒" },
  { id: "next-step", label: "下一步" }
];

export default function DesignPreviewPage() {
  return (
    <main className="bg-[#f7f4ec] text-[#1f2623]">
      <section className="relative overflow-hidden border-b border-[#ded8ca] bg-[#f7f4ec]">
        <Image
          src="/images/lung-main.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f4ec] via-[#f7f4ec]/92 to-[#f7f4ec]/30" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f4ec]/15 via-transparent to-[#f7f4ec]/65" aria-hidden="true" />
        <div className="section-shell relative flex min-h-[620px] items-center py-12 lg:py-16">
          <div className="max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#ded8ca] bg-[#fffdf7] px-5 py-2.5 text-sm font-medium text-[#5c665f] shadow-sm">
              <Stethoscope className="h-4 w-4 text-[#28675b]" aria-hidden="true" />
              Chest Care Guidebook Preview
            </div>
            <h1 className="max-w-4xl text-3xl font-semibold leading-[1.35] tracking-normal text-[#1f2623] sm:text-4xl lg:text-5xl">
              胸腔重症間，陪你找回自然的呼吸
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5c665f]">
              這是一個偏 guidebook 風格的首頁草稿：用清楚的問題入口、章節卡與柔和色塊，把醫學筆記整理成更容易探索的知識地圖。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex h-14 items-center gap-2 rounded-full bg-[#b1d9d4] px-8 text-base font-semibold text-[#1f2623] shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#a3cec8]"
              >
                開始搜尋
                <Search className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/education"
                className="inline-flex h-14 items-center gap-2 rounded-full border border-[#ded8ca] bg-[#fffdf7] px-8 text-base font-semibold text-[#1f2623] shadow-sm transition-transform hover:-translate-y-0.5 hover:border-[#c4d6c3] hover:bg-[#eef3ec]"
              >
                看衛教園區
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div
              id="quick-search"
              className="mt-10 max-w-3xl rounded-[2rem] border border-[#6fa2b1] p-6 shadow-lg backdrop-blur"
              style={{ background: "linear-gradient(135deg, rgba(71, 139, 162, 0.94), rgba(111, 168, 181, 0.9), rgba(178, 197, 198, 0.86))" }}
            >
              <p className="text-xl font-semibold text-[#f7f4ec]">以問題開始</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {guideQuestions.map((question) => (
                  <Link
                    key={question.title}
                    href={question.href}
                    className={`group flex items-center justify-between gap-4 rounded-full border px-5 py-3.5 shadow-sm transition-transform hover:-translate-y-0.5 ${question.color}`}
                  >
                    <span className="text-base font-semibold">{question.title}</span>
                    <span className="flex items-center gap-2 text-sm">
                      {question.count}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-12">
        <nav className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden" aria-label="頁內導覽">
          {pageSections.map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[#ded8ca] bg-[#fffdf7] px-4 text-sm font-semibold text-[#4d5a53] shadow-sm"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e9e5dc] text-xs">{index + 1}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden rounded-[2rem] border border-[#ded8ca] bg-[#fffdf7] p-5 shadow-sm lg:sticky lg:top-24 lg:block lg:self-start">
            <p className="text-sm font-semibold text-[#6a716c]">網站導覽</p>
            <nav className="mt-5 space-y-3 text-sm">
              {pageSections.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-3 rounded-full px-2 py-1.5 text-[#4d5a53] transition-colors hover:bg-[#f2eee5]"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9e5dc] text-sm font-semibold text-[#5c665f] shadow-inner">
                    {index + 1}
                  </span>
                  <span className="text-base font-medium">{item.label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-10">
            <section id="chapter-entry" className="scroll-mt-24">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#28675b]">Start Here</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-normal">先選你現在需要的資訊</h2>
                </div>
                  <p className="hidden max-w-sm text-sm leading-6 text-[#6a716c] sm:block">
                  這種版面適合把網站變成一本線上筆記本，使用者不用先理解分類架構，也能從問題進入。
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {chapterCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.title}
                      href={card.href}
                      className="group overflow-hidden rounded-[2rem] border border-[#ded8ca] bg-[#fffdf7] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative h-48">
                        <Image src={card.image} alt="" fill sizes="50vw" className="object-cover" />
                        <div className={`absolute inset-0 bg-gradient-to-t ${card.accent}`} aria-hidden="true" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#fffdf7]/18 via-transparent to-[#fffdf7]/42" aria-hidden="true" />
                        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                          <div>
                            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full border border-[#2b4c40]/35 bg-[#fffdf7]/96 text-[#2b4c40] shadow-md backdrop-blur">
                              <Icon className="h-6 w-6" aria-hidden="true" />
                            </span>
                            <h3 className="inline-block rounded-full border border-[#2b4c40]/35 bg-[#fffdf7]/96 px-4 py-2 text-xl font-semibold tracking-normal text-[#1f2623] shadow-md backdrop-blur">
                              {card.title}
                            </h3>
                          </div>
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#2b4c40]/35 bg-[#fffdf7]/96 text-[#2b4c40] shadow-md backdrop-blur">
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-sm leading-7 text-[#5c665f]">{card.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section id="reading-principles" className="scroll-mt-24 rounded-[2rem] border border-[#ded8ca] bg-[#fffdf7] p-6 shadow-sm">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div>
                  <p className="text-sm font-semibold text-[#28675b]">Reading Principles</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-normal">讓醫學資訊讀起來更安定</h2>
                  <p className="mt-4 leading-7 text-[#5c665f]">
                    如果把這個方向套到正式網站，可以讓首頁更像一份溫柔但專業的照護指南：少一點資料庫感，多一點「我知道下一步要去哪裡」的安心感。
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[#f2eee5] p-4">
                  <div className="space-y-3">
                    {principles.map((principle) => (
                      <div key={principle} className="flex gap-3 rounded-full bg-[#fffdf7] px-4 py-3 text-sm font-medium text-[#4d5a53] shadow-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#28675b]" aria-hidden="true" />
                        <span>{principle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="visual-sections" className="scroll-mt-24">
              <div className="mb-5">
                <p className="text-sm font-semibold text-[#28675b]">Visual Sections</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal">用圖片幫每個入口建立情緒</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    title: "病人衛教",
                    image: "/images/patient-education-hero.png",
                    text: "溫暖、穩定、讓人願意慢慢讀。"
                  },
                  {
                    title: "醫學新知",
                    image: "/images/medical-news-hero.png",
                    text: "研究感、資料感，但維持乾淨。"
                  },
                  {
                    title: "教學筆記",
                    image: "/images/teaching-hero.png",
                    text: "適合課程、投影片、QA 互動入口。"
                  }
                ].map((item) => (
                  <div key={item.title} className="overflow-hidden rounded-[2rem] border border-[#ded8ca] bg-[#fffdf7] shadow-sm">
                    <div className="relative h-40">
                      <Image src={item.image} alt="" fill sizes="33vw" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" aria-hidden="true" />
                      <h3 className="absolute bottom-4 left-4 text-xl font-semibold text-white">{item.title}</h3>
                    </div>
                    <p className="p-4 text-sm leading-6 text-[#5c665f]">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="next-step" className="grid scroll-mt-24 gap-4 md:grid-cols-3">
              <div className="rounded-[2rem] border border-[#ded8ca] bg-[#fffdf7] p-5 shadow-sm">
                <ClipboardList className="h-7 w-7 text-[#5b778e]" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">適合衛教</h3>
                <p className="mt-2 text-sm leading-6 text-[#5c665f]">用問題和情境分流，降低病人閱讀壓力。</p>
              </div>
              <div className="rounded-[2rem] border border-[#ded8ca] bg-[#fffdf7] p-5 shadow-sm">
                <ShieldCheck className="h-7 w-7 text-[#28675b]" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">適合醫師筆記</h3>
                <p className="mt-2 text-sm leading-6 text-[#5c665f]">章節卡能清楚承載指南、研究、PDF 和互動報告。</p>
              </div>
              <div className="rounded-[2rem] border border-[#ded8ca] bg-[#fffdf7] p-5 shadow-sm">
                <HeartPulse className="h-7 w-7 text-[#e79e90]" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">適合手機閱讀</h3>
                <p className="mt-2 text-sm leading-6 text-[#5c665f]">卡片大、入口明確，對長輩和病人更友善。</p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
