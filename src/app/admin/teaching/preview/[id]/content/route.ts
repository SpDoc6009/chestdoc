import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function injectResizeScript(html: string, lessonId: string) {
  const style = `
<style>
  html,
  body {
    max-width: 100%;
    overflow-x: hidden !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  img,
  svg,
  canvas,
  video {
    max-width: 100% !important;
    height: auto !important;
  }

  img.figure-image,
  .figure-placeholder img {
    display: block;
    width: min(100%, 1000px) !important;
    max-width: 100% !important;
    height: auto !important;
    margin: 18px auto;
    object-fit: contain;
  }

  table {
    max-width: 100%;
  }
</style>`;
  const script = `
<script>
(() => {
  const reportId = ${JSON.stringify(lessonId)};
  let lastHeight = 0;
  function getHeight() {
    const body = document.body;
    const html = document.documentElement;
    return Math.max(
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      html ? html.scrollHeight : 0,
      html ? html.offsetHeight : 0
    );
  }
  function sendHeight() {
    const height = getHeight();
    if (Math.abs(height - lastHeight) < 4) return;
    lastHeight = height;
    window.parent.postMessage({ type: "html-report-height", id: reportId, height }, "*");
  }
  window.addEventListener("load", sendHeight);
  window.addEventListener("resize", sendHeight);
  new ResizeObserver(sendHeight).observe(document.documentElement);
  if (document.body) new ResizeObserver(sendHeight).observe(document.body);
  new MutationObserver(sendHeight).observe(document.documentElement, { childList: true, subtree: true, attributes: true });
  setTimeout(sendHeight, 50);
  setTimeout(sendHeight, 400);
  setTimeout(sendHeight, 1200);
})();
</script>`;
  const injected = `${style}${script}`;

  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${injected}</body>`);
  }

  return `${html}${injected}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const lesson = await prisma.teachingLesson.findUnique({ where: { id } });
  if (!lesson || !lesson.htmlContent) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(injectResizeScript(lesson.htmlContent, lesson.id), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data: https:; connect-src 'none';"
    }
  });
}
