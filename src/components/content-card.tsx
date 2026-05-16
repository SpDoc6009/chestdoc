import Link from "next/link";
import { Activity, ArrowRight, BookOpenCheck, FileText, LinkIcon, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ContentCardProps = {
  href: string;
  title: string;
  summary?: string | null;
  date?: Date;
  label?: string;
  type?: "article" | "report" | "teaching" | "pdf" | "link";
  keywords?: string[];
};

const typeStyles = {
  article: {
    accent: "from-sky-500 to-cyan-400",
    chip: "border-sky-100 bg-sky-50 text-sky-800",
    eyebrow: "Visual Note",
    icon: PenLine,
    iconBg: "bg-sky-50 text-sky-700"
  },
  report: {
    accent: "from-indigo-500 to-blue-400",
    chip: "border-indigo-100 bg-indigo-50 text-indigo-800",
    eyebrow: "Medical Update",
    icon: Activity,
    iconBg: "bg-indigo-50 text-indigo-700"
  },
  teaching: {
    accent: "from-amber-400 to-sky-400",
    chip: "border-amber-100 bg-amber-50 text-amber-800",
    eyebrow: "Teaching",
    icon: BookOpenCheck,
    iconBg: "bg-amber-50 text-amber-700"
  },
  pdf: {
    accent: "from-slate-500 to-blue-400",
    chip: "border-slate-200 bg-slate-50 text-slate-700",
    eyebrow: "PDF",
    icon: FileText,
    iconBg: "bg-slate-100 text-slate-700"
  },
  link: {
    accent: "from-emerald-500 to-cyan-400",
    chip: "border-emerald-100 bg-emerald-50 text-emerald-800",
    eyebrow: "Link",
    icon: LinkIcon,
    iconBg: "bg-emerald-50 text-emerald-700"
  }
};

export function ContentCard({ href, title, summary, date, label, type = "article", keywords = [] }: ContentCardProps) {
  const style = typeStyles[type];
  const Icon = style.icon;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className={cn("h-1.5 bg-gradient-to-r", style.accent)} aria-hidden="true" />
      <CardHeader className="pb-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={style.chip}>{label ?? style.eyebrow}</Badge>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{style.eyebrow}</span>
          </div>
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", style.iconBg)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        {date ? <span className="text-xs text-muted-foreground">{formatDate(date)}</span> : null}
        <CardTitle className="leading-7">
          <Link href={href} className="hover:text-primary">
            <span className="absolute inset-0" aria-hidden="true" />
            {title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summary ? <CardDescription className="line-clamp-3 leading-6">{summary}</CardDescription> : null}
        {keywords.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {keywords.slice(0, 4).map((keyword) => (
              <span key={keyword} className="relative z-10 rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500">
                #{keyword}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary opacity-80 transition-opacity group-hover:opacity-100">
          <span>閱讀內容</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
