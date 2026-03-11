import DOMPurify from "dompurify";

const ENCODED_HTML_PATTERN = /&(lt|gt|amp|quot|#\d+|#x[a-f0-9]+);/i;
const ESCAPED_UNICODE_HTML_PATTERN = /\\u00(?:3c|3e|26|22)/i;

const decodeHtmlEntities = (value: string): string => {
  if (!value || typeof document === "undefined") return value;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

const decodeEscapedUnicode = (value: string): string =>
  value
    .replace(/\\u003c/gi, "<")
    .replace(/\\u003e/gi, ">")
    .replace(/\\u0026/gi, "&")
    .replace(/\\u0022/gi, '"');

const tryParseJsonString = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('"') || !trimmed.endsWith('"')) {
    return value;
  }

  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed === "string" ? parsed : value;
  } catch {
    return value;
  }
};

const normalizePossiblyEncodedHtml = (value: string): string => {
  if (!ENCODED_HTML_PATTERN.test(value) && !ESCAPED_UNICODE_HTML_PATTERN.test(value)) {
    return value;
  }

  let normalized = value;
  for (let index = 0; index < 6; index += 1) {
    let decoded = tryParseJsonString(normalized);
    decoded = decodeEscapedUnicode(decoded);
    decoded = decodeHtmlEntities(decoded);
    if (decoded === normalized) {
      break;
    }
    normalized = decoded;
  }

  return normalized;
};

export const sanitizeHtml = (value: string): string =>
  DOMPurify.sanitize(normalizePossiblyEncodedHtml(value), {
    USE_PROFILES: { html: true },
  });

export const stripHtml = (value: string): string => {
  const safe = sanitizeHtml(value);
  return safe.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};
