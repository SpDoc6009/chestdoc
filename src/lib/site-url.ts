export function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/^["']|["']$/g, "");
  if (!rawUrl) return new URL("http://localhost:3000");

  try {
    return new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
  } catch {
    return new URL("http://localhost:3000");
  }
}
