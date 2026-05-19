import { NextResponse } from "next/server";
import { getPublishedReportBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

function injectResizeScript(html: string, reportId: string) {
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
  const reportId = ${JSON.stringify(reportId)};
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

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getPublishedReportBySlug(slug);
  if (!report) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(injectResizeScript(report.htmlContent, report.id), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data: https:; connect-src 'none';"
    }
  });
}
