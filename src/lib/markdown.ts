import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/** Render Markdown operator → HTML yang sudah disanitasi (anti-XSS). */
export function renderMarkdown(md: string) {
  const html = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
    allowedAttributes: { a: ["href", "title", "rel", "target"], img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["https", "mailto", "tel"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  });
}
