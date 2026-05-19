"use client";

import { useEffect, useRef, useState } from "react";

type AutoHeightReportFrameProps = {
  title: string;
  src: string;
  reportId: string;
};

export function AutoHeightReportFrame({ title, src, reportId }: AutoHeightReportFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!event.data || event.data.type !== "html-report-height" || event.data.id !== reportId) return;

      const nextHeight = Number(event.data.height);
      if (Number.isFinite(nextHeight) && nextHeight > 0) {
        setHeight(Math.max(640, Math.ceil(nextHeight)));
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [reportId]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      src={src}
      sandbox="allow-scripts allow-forms allow-popups"
      scrolling="no"
      className="mt-8 block w-full border-0 bg-transparent"
      style={{ height }}
    />
  );
}
