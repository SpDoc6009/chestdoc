import Link from "next/link";
import Image from "next/image";
import { BookOpenCheck, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "匹車歪教學筆記"
};

export default async function TeachingPage() {
  const topics = await prisma.teachingTopic.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
        take: 4
      },
      _count: {
        select: { lessons: true }
      }
    }
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <Image
          src="/images/teaching-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/20" aria-hidden="true" />
        <div className="section-shell relative flex min-h-[300px] items-center py-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">Interactive Teaching Notes</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">匹車歪教學筆記</h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              收集可教學、可互動、可重複使用的圖文筆記、QA 卡與投影片式內容。
            </p>
          </div>
        </div>
      </section>
      <main className="section-shell py-10">
        <div className="grid gap-5 lg:grid-cols-2">
          {topics.map((topic) => (
            <Card key={topic.id} className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <div className="h-1.5 bg-gradient-to-r from-amber-400 via-sky-400 to-blue-600" aria-hidden="true" />
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary">
                      <Layers className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <Link href={`/teaching/${topic.slug}`} className="hover:text-primary">
                      {topic.title}
                    </Link>
                  </CardTitle>
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                    {topic._count.lessons} 篇
                  </span>
                </div>
                {topic.description ? <p className="text-sm leading-6 text-muted-foreground">{topic.description}</p> : null}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topic.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/t/${lesson.id}`}
                      className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50"
                    >
                      <BookOpenCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="line-clamp-2">{lesson.title}</span>
                    </Link>
                  ))}
                  {topic.lessons.length === 0 ? (
                    <p className="rounded-md border border-dashed border-border bg-slate-50 px-3 py-4 text-sm text-muted-foreground">
                      尚未發布教學內容。
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
