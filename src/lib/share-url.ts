import { getSiteUrl } from "@/lib/site-url";

type ShareType = "article" | "report" | "pdf" | "teaching";

const sharePrefixes: Record<ShareType, string> = {
  article: "a",
  report: "r",
  pdf: "p",
  teaching: "t"
};

export function getSharePath(type: ShareType, id: string) {
  return `/${sharePrefixes[type]}/${id}`;
}

export function getShareUrl(type: ShareType, id: string) {
  return new URL(getSharePath(type, id), getSiteUrl()).toString();
}
