import { notFound } from "next/navigation";
import { ContentCard } from "@/components/content-card";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await prisma.teachingTopic.findUnique({ where: { slug } });
  return { title: topic?.title ?? "匹車歪教學筆記" };
}

export default async function TeachingTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await prisma.teachingTopic.findUnique({
    where: { slug },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }]
      }
    }
  });
  if (!topic) notFound();

  return (
    <main className="section-shell py-10">
      <h1 className="text-3xl font-semibold tracking-normal">{topic.title}</h1>
      {topic.description ? <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{topic.description}</p> : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topic.lessons.map((lesson) => (
          <ContentCard
            key={lesson.id}
            href={`/t/${lesson.id}`}
            title={lesson.title}
            summary={lesson.summary}
            date={lesson.updatedAt}
            label={lesson.markdownContent && lesson.htmlContent ? "混合教學" : lesson.htmlContent ? "互動教學" : "圖文筆記"}
            type="teaching"
            keywords={lesson.keywords}
          />
        ))}
      </div>
    </main>
  );
}
