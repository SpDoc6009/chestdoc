import type React from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

const adminNav = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/categories", label: "分類" },
  { href: "/admin/reports", label: "醫學新知" },
  { href: "/admin/articles", label: "圖文解說" },
  { href: "/admin/articles/new?kind=education", label: "新增衛教" },
  { href: "/admin/education-qr", label: "衛教 QR Code" },
  { href: "/admin/teaching", label: "教學筆記" },
  { href: "/admin/pdfs", label: "PDF" },
  { href: "/admin/links", label: "連結" },
  { href: "/admin/stats", label: "統計" }
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="section-shell py-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">後台管理</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-900">{title}</h1>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">登出</Button>
        </form>
      </div>
      <nav className="mb-7 flex flex-wrap gap-2">
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:border-blue-200 hover:bg-blue-50"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </main>
  );
}
