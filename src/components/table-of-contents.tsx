import Link from "next/link";
import type { MarkdownHeading } from "@/lib/markdown";

export function TableOfContents({ headings }: { headings: MarkdownHeading[] }) {
  if (headings.length === 0) return null;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-lg border border-border bg-white/85 p-4 shadow-sm backdrop-blur">
        <p className="mb-3 text-sm font-semibold text-slate-800">文章目錄</p>
        <nav className="space-y-1 text-sm">
          {headings.map((heading) => (
            <Link
              key={heading.id}
              href={`#${heading.id}`}
              className={`block rounded-md px-2 py-1.5 leading-5 text-muted-foreground transition-colors hover:bg-blue-50 hover:text-primary ${
                heading.level === 3 ? "pl-5 text-xs" : ""
              }`}
            >
              {heading.text}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
