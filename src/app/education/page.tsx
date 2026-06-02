import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, ClipboardList, HeartPulse, Home, Pill, QrCode, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "衛教園區"
};

const educationTopics = [
  {
    title: "認識疾病",
    description: "先了解疾病原因、症狀與追蹤重點。",
    query: "認識疾病",
    icon: Stethoscope,
    color: "bg-white/90 text-[#5b778e]",
    surface: "border-[#d4dee3] bg-[#e8f0f3]"
  },
  {
    title: "檢查前後",
    description: "檢查前要準備什麼，檢查後要注意什麼。",
    query: "檢查",
    icon: ClipboardList,
    color: "bg-white/90 text-[#7a624d]",
    surface: "border-[#ecd2bd] bg-[#f8e4d1]"
  },
  {
    title: "藥物與治療",
    description: "用比較白話的方式整理治療選擇與用藥提醒。",
    query: "治療",
    icon: Pill,
    color: "bg-white/90 text-[#7d5b62]",
    surface: "border-[#ebc7cc] bg-[#f6d9dd]"
  },
  {
    title: "居家照護",
    description: "把日常照護、運動、警訊與回診重點放在一起。",
    query: "居家照護",
    icon: Home,
    color: "bg-white/90 text-[#526b46]",
    surface: "border-[#c6d5b8] bg-[#dbe8cf]"
  },
  {
    title: "QR code 列印",
    description: "勾選需要的衛教文章，一次列印 QR code 帶回家。",
    href: "/education/qr",
    query: "",
    icon: QrCode,
    color: "bg-white/90 text-[#2f6558]",
    surface: "border-[#b8d0c4] bg-[#cfe2d8]"
  }
];

function audienceLabel(keywords: string[]) {
  if (keywords.includes("一般民眾")) return "一般民眾";
  if (keywords.includes("病人與家屬")) return "病人與家屬";
  if (keywords.includes("醫療人員")) return "醫療人員";
  if (keywords.includes("進階閱讀")) return "進階閱讀";
  return "衛教資料";
}

export default async function EducationPage() {
  const articles = await prisma.article.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: "衛教", mode: "insensitive" } },
        { summary: { contains: "衛教", mode: "insensitive" } },
        { content: { contains: "衛教", mode: "insensitive" } },
        { htmlContent: { contains: "衛教", mode: "insensitive" } },
        { keywords: { has: "衛教" } },
        { keywords: { has: "patient-education" } }
      ]
    },
    orderBy: { updatedAt: "desc" },
    include: { category: true, subcategory: true }
  });

  return (
    <main className="bg-[#fff8f3]">
      <section className="relative overflow-hidden border-b border-[#f1ded3] bg-[#fff8f3]">
        <Image
          src="/images/patient-education-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fff8f3] via-[#fff8f3]/94 to-[#f9d9ca]/35" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff8f3]/20 via-transparent to-[#fff8f3]" aria-hidden="true" />
        <div className="section-shell relative flex min-h-[360px] items-center py-12">
          <div className="max-w-2xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[#f9d9ca] text-[#8e5551] shadow-sm">
              <HeartPulse className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-[#8e5551]">Patient Education</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-[#3f4a45] sm:text-5xl">衛教園區</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#6f7772]">
              把檢查、治療與居家照護重點，整理成病人與家屬容易閱讀的版本。
            </p>
          </div>
        </div>
      </section>

      <div className="section-shell py-10">
        <section className="mb-12">
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#8e5551]">Start Here</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-[#3f4a45]">你現在想了解什麼？</h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#6f7772]">
              可以先從最接近目前狀況的主題開始看。每個方塊都可以直接點進去。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {educationTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Link
                  key={topic.title}
                  href={topic.href ?? `/search?q=${encodeURIComponent(topic.query)}&type=education`}
                  className={`group flex min-h-44 flex-col justify-between rounded-[2.25rem] border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92 hover:shadow-md sm:min-h-52 sm:p-6 ${topic.href ? "col-span-2 lg:col-span-1" : ""} ${topic.surface}`}
                >
                  <span className={`flex h-16 w-16 items-center justify-center rounded-[1.35rem] shadow-sm sm:h-20 sm:w-20 ${topic.color}`}>
                    <Icon className="h-9 w-9 sm:h-10 sm:w-10" aria-hidden="true" />
                  </span>
                  <span className="mt-5 block">
                    <span className="block text-2xl font-semibold leading-8 text-[#26302c]">{topic.title}</span>
                    <span className="mt-2 block text-base leading-7 text-[#5f6863]">{topic.description}</span>
                  </span>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#3f4a45]">
                    {topic.href ? "產生列印版" : "查看內容"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#8e5551]">Latest Notes</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-[#3f4a45]">最新衛教資料</h2>
          </div>
        {articles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/a/${article.id}`}
                className="group flex min-h-64 flex-col rounded-[2rem] border border-[#ead8ca] bg-[#fffdf8] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#e4c3b1] hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#f9d9ca] px-3 py-1.5 text-xs font-semibold text-[#8e5551]">
                    {audienceLabel(article.keywords)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#6f7772]">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatDate(article.updatedAt)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold leading-8 text-[#26302c] group-hover:text-[#8e5551]">
                  {article.title}
                </h3>
                <p className="mt-3 line-clamp-3 leading-7 text-[#6f7772]">{article.summary}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-[#2f6558]">
                  閱讀衛教
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="rounded-[2rem] border-dashed border-[#ead8ca] bg-[#fffdf8]/85">
            <CardContent className="p-8 text-sm leading-7 text-[#6f7772]">
              目前還沒有已發布的衛教文章。之後在「圖文解說」新增或編輯文章時，於關鍵字填入「衛教」，文章就會自動出現在這裡。
            </CardContent>
          </Card>
        )}
        </section>
      </div>
    </main>
  );
}
