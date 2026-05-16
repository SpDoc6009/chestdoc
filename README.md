# 在胸腔重症裡，陪你找回自然的呼吸

可部署到 Vercel 的 Next.js 醫學知識網站，用來管理胸腔科醫學筆記、指南整理、AI 深度研究報告、衛教資料、PDF 文件庫與常用網站連結。

## 技術架構

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui 風格元件
- Prisma ORM
- PostgreSQL
- Vercel Blob PDF 儲存
- ADMIN_PASSWORD + httpOnly cookie 後台保護

## 本機安裝

```bash
npm install
```

## 設定環境變數

複製 `.env.example` 為 `.env`，並填入實際值：

```bash
cp .env.example .env
```

需要設定：

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST-POOLER/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
ADMIN_PASSWORD="your-admin-password"
ADMIN_SESSION_SECRET="a-long-random-secret"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-read-write-token"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

`DATABASE_URL` 建議使用 Neon pooled connection，也就是 host 通常包含 `-pooler`。`DATABASE_URL_UNPOOLED` 使用 Neon direct connection，供 Prisma migration 使用。`ADMIN_PASSWORD` 只在伺服器端使用，不會暴露到前端。PDF 上傳需要 Vercel Blob 的 `BLOB_READ_WRITE_TOKEN`。`NEXT_PUBLIC_SITE_URL` 本機可用 `http://localhost:3000`，正式部署後改成你的 Vercel 或自訂網域。

## 資料庫 migration

開發環境建立資料表：

```bash
npm run prisma:migrate
```

正式環境部署 migration：

```bash
npm run prisma:deploy
```

需要重新產生 Prisma Client 時：

```bash
npm run prisma:generate
```

## 啟動本機開發伺服器

```bash
npm run dev
```

開啟 `http://localhost:3000`。

後台路徑：

```text
/admin/login
```

使用 `.env` 中的 `ADMIN_PASSWORD` 登入。

## 建置檢查

```bash
npm run lint
npm run build
```

`npm run build` 會依序執行 `prisma generate`、ESLint、TypeScript 檢查，再執行 Next.js production build。

## Push 到 GitHub

```bash
git init
git add .
git commit -m "Initial pulmonary notebook site"
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repo>.git
git push -u origin main
```

如果這個資料夾已經有 Git repository，只需要設定 remote 後 push。

## 部署到 Vercel

1. 到 Vercel 建立新專案，選擇 GitHub repository。
2. Framework Preset 選 Next.js。
3. 在 Project Settings 的 Environment Variables 加入：
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - `BLOB_READ_WRITE_TOKEN`
   - `NEXT_PUBLIC_SITE_URL`
4. 在 Vercel 建立或連接 PostgreSQL 資料庫，確認 `DATABASE_URL` 指向正式資料庫。
5. 在 Vercel 建立 Blob Store，取得 `BLOB_READ_WRITE_TOKEN`。
6. 將 `NEXT_PUBLIC_SITE_URL` 設為正式網站網址，例如 `https://your-site.vercel.app`。
7. 第一次部署前，在本機或 CI 對正式資料庫執行：

```bash
npm run prisma:deploy
```

8. 推送到 main branch，Vercel 會自動部署。

## 內容管理

- `/admin/categories`：管理大分類與小分類
- `/admin/articles`、`/admin/articles/new`：管理醫學文章，內容使用 Markdown
- `/admin/articles/new?kind=education`：快速新增衛教文章，會預先填入衛教關鍵字
- `/admin/reports`、`/admin/reports/new`：管理 HTML Canvas 報告
- `/admin/teaching`、`/admin/teaching/new`：管理匹車歪教學筆記，可建立 Markdown 圖文或互動 HTML 教學內容
- `/admin/pdfs`、`/admin/pdfs/new`：上傳 PDF 到 Vercel Blob，並可編輯標題、描述、分類、關鍵字或刪除文件
- `/admin/links`：管理常用網站連結

HTML 報告前台使用 iframe sandbox 呈現，避免直接注入主頁面。PDF 上傳在 server action 中檢查 MIME type 必須為 `application/pdf`。
