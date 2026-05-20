export function createQrImageUrl(text: string, size = 420) {
  const url = new URL("https://quickchart.io/qr");
  url.searchParams.set("text", text);
  url.searchParams.set("format", "svg");
  url.searchParams.set("size", String(size));
  url.searchParams.set("margin", "4");
  url.searchParams.set("ecLevel", "H");
  url.searchParams.set("dark", "0f172a");
  url.searchParams.set("light", "ffffff");
  return url.toString();
}
