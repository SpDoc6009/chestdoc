"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/", label: "首頁" },
  { href: "/reports", label: "醫學新知" },
  { href: "/articles", label: "圖文解說" },
  { href: "/education", label: "衛教園區" },
  { href: "/teaching", label: "匹車歪教學筆記" },
  { href: "/categories", label: "疾病分類" },
  { href: "/pdfs", label: "PDF 文件庫" },
  { href: "/links", label: "常用連結" },
  { href: "/search", label: "搜尋" }
];

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-input bg-white px-3 text-sm font-medium text-slate-700"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="grid gap-1" aria-hidden="true">
          <span className="block h-0.5 w-4 rounded-full bg-current" />
          <span className="block h-0.5 w-4 rounded-full bg-current" />
          <span className="block h-0.5 w-4 rounded-full bg-current" />
        </span>
        選單
      </button>

      {isOpen ? (
        <nav
          id="mobile-navigation"
          className="absolute left-4 right-4 top-[calc(100%+8px)] rounded-lg border border-border bg-white p-2 shadow-lg"
        >
          <div className="grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-md bg-primary px-3 py-3 text-sm font-medium text-white hover:bg-primary/90"
                onClick={() => setIsOpen(false)}
              >
                後台管理
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
