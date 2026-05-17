import Link from "next/link";
import Image from "next/image";
import { ClipboardList, HeartPulse, Home, Pill, Stethoscope } from "lucide-react";
import { ContentCard } from "@/components/content-card";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "衛教園區"
};

const educationTopics = [
  {
    title: "認識疾病",
    query: "認識疾病",
    icon: Stethoscope,
    color: "bg-white/85 text-blue-700",
    surface: "border-blue-100 bg-blue-50/95"
  },
  {
    title: "檢查前後",
    query: "檢查",
    icon: ClipboardList,
    color: "bg-white/85 text-cyan-700",
    surface: "border-cyan-100 bg-cyan-50/95"
  },
  {
    title: "藥物與治療",
    query: "治療",
    icon: Pill,
    color: "bg-white/85 text-indigo-700",
    surface: "border-indigo-100 bg-indigo-50/95"
  },
  {
    title: "居家照護",
    query: "居家照護",
    icon: Home,
    color: "bg-white/85 text-rose-700",
    surface: "border-rose-100 bg-rose-50/95"
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
        { keywords: { has: "衛教" } },
        { keywords: { has: "patient-education" } }
      ]
    },
    orderBy: { updatedAt: "desc" },
    include: { category: true, subcategory: true }
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <Image
          src="/images/patient-education-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-rose-50/92 to-rose-50/20" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30" aria-hidden="true" />
        <div className="section-shell relative flex min-h-[300px] items-center py-10">
          <div className="max-w-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <HeartPulse className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-rose-700">Patient Education</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">衛教園區</h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              用比較容易理解的方式整理胸腔疾病、檢查、治療與居家照護重點，陪病人與家屬慢慢讀懂每一次呼吸。
            </p>
          </div>
        </div>
      </section>

      <main className="section-shell py-10">
        <section className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-title">衛教主題入口</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {educationTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Link
                  key={topic.title}
                  href={`/search?q=${encodeURIComponent(topic.query)}&type=education`}
                  className={`group flex aspect-square flex-col items-center justify-center rounded-lg border p-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md sm:p-5 ${topic.surface}`}
                >
                  <span className={`mb-3 flex h-14 w-14 items-center justify-center rounded-md shadow-sm sm:h-16 sm:w-16 ${topic.color}`}>
                    <Icon className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true" />
                  </span>
                  <span className="block text-lg font-semibold leading-7 text-slate-950 sm:text-xl">{topic.title}</span>
                  <span className="mt-2 hidden text-sm leading-6 text-muted-foreground group-hover:text-slate-700 sm:block">
                    查看相關衛教內容
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-title">最新衛教資料</h2>
        </div>
        {articles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ContentCard
                key={article.id}
                href={`/articles/${article.id}`}
                title={article.title}
                summary={article.summary}
                date={article.updatedAt}
                label={audienceLabel(article.keywords)}
                type="article"
                keywords={article.keywords}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed bg-white/80">
            <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
              目前還沒有已發布的衛教文章。之後在「圖文解說」新增或編輯文章時，於關鍵字填入「衛教」，文章就會自動出現在這裡。
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
