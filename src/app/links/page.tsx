import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "常用連結"
};

export default async function LinksPage() {
  const links = await prisma.usefulLink.findMany({
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }, { title: "asc" }]
  });
  const groups = links.reduce<Record<string, typeof links>>((acc, link) => {
    acc[link.group] = [...(acc[link.group] ?? []), link];
    return acc;
  }, {});

  return (
    <main className="section-shell py-10">
      <h1 className="text-3xl font-semibold tracking-normal">常用網站連結</h1>
      <div className="mt-8 space-y-8">
        {Object.entries(groups).map(([group, groupLinks]) => (
          <section key={group}>
            <h2 className="mb-4 text-xl font-semibold tracking-normal">{group}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupLinks.map((link) => (
                <Card key={link.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary">
                        {link.title}
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </CardTitle>
                  </CardHeader>
                  {link.description ? <CardContent className="text-sm leading-6 text-muted-foreground">{link.description}</CardContent> : null}
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
