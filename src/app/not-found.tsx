import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main className="section-shell py-16">
      <h1 className="text-3xl font-semibold tracking-normal">找不到頁面</h1>
      <p className="mt-3 text-muted-foreground">這筆內容可能尚未發布，或網址已變更。</p>
      <Link href="/" className="mt-6 inline-flex text-sm font-medium text-primary hover:underline">
        回首頁
      </Link>
    </main>
  );
}
