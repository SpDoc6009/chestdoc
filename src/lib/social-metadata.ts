import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

function absoluteUrl(value: string) {
  const base = getSiteUrl();

  try {
    return new URL(value);
  } catch {
    return new URL(value.startsWith("/") ? value : `/${value}`, base);
  }
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanDescription(value?: string | null) {
  const description = stripTags(value ?? "");
  return description.length > 160 ? `${description.slice(0, 157)}...` : description;
}

function cleanImageUrl(value?: string | null) {
  const image = value?.trim();
  if (!image) return null;
  if (image.startsWith("data:") || image.startsWith("blob:")) return null;
  if (image.startsWith("#")) return null;
  return image.replace(/^["']|["']$/g, "");
}

export function firstMarkdownImage(markdown?: string | null) {
  const match = markdown?.match(/!\[[^\]]*]\(\s*(?:<([^>]+)>|([^\s)]+))/);
  return cleanImageUrl(match?.[1] ?? match?.[2]);
}

export function firstHtmlImage(html?: string | null) {
  const match = html?.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/i);
  return cleanImageUrl(match?.[1]);
}

function generatedOgImage(title: string, section: string) {
  const url = new URL("/og", getSiteUrl());
  url.searchParams.set("title", title);
  url.searchParams.set("section", section);
  return url;
}

type SocialMetadataInput = {
  title: string;
  description?: string | null;
  path: string;
  section: "article" | "report" | "pdf" | "teaching";
  image?: string | null;
};

export function createSocialMetadata({
  title,
  description,
  path,
  section,
  image
}: SocialMetadataInput): Metadata {
  const pageUrl = absoluteUrl(path);
  const fallbackImage = image ?? generatedOgImage(title, section).toString();
  const imageUrl = absoluteUrl(fallbackImage);
  const summary = cleanDescription(description);

  return {
    title,
    description: summary || undefined,
    alternates: {
      canonical: pageUrl
    },
    openGraph: {
      title,
      description: summary || undefined,
      url: pageUrl,
      type: "article",
      locale: "zh_TW",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: summary || undefined,
      images: [imageUrl.toString()]
    }
  };
}
