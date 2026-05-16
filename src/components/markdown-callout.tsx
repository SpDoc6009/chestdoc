import type { ReactNode } from "react";
import { AlertTriangle, Lightbulb, Stethoscope, Info } from "lucide-react";

function nodeText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(nodeText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return nodeText((children as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

export function MarkdownCallout({ children }: { children?: ReactNode }) {
  const text = nodeText(children).trim();
  const isWarning = /^(警示|注意|危險|紅旗|red flag)/i.test(text);
  const isClinical = /^(臨床重點|臨床提醒|clinical)/i.test(text);
  const isTip = /^(提醒|小提醒|建議|tip)/i.test(text);
  const isKey = /^(重點|重點摘要|key point|takeaway)/i.test(text);

  const Icon = isWarning ? AlertTriangle : isClinical ? Stethoscope : isTip ? Lightbulb : Info;
  const className = isWarning
    ? "border-rose-300 bg-rose-50 text-rose-950"
    : isClinical
      ? "border-indigo-300 bg-indigo-50 text-indigo-950"
      : isTip
        ? "border-amber-300 bg-amber-50 text-amber-950"
        : isKey
          ? "border-sky-300 bg-sky-50 text-sky-950"
          : "border-sky-300 bg-blue-50/70 text-slate-700";

  return (
    <blockquote className={`not-prose my-6 rounded-lg border-l-4 px-5 py-4 ${className}`}>
      <div className="flex gap-3">
        <Icon className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 text-sm leading-7">{children}</div>
      </div>
    </blockquote>
  );
}
