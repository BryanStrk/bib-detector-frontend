// Helpers for turning raw backend responses into the shape the UI renders,
// and for scaling pixel bounding boxes to layout-independent percentages.

/**
 * Map raw API detections to the internal model. Keeps `confidence` as 0–1
 * (ConfidenceBar/tier logic expects that range) and keeps `bbox` in original
 * pixels for later percentage scaling.
 */
export function mapDetections(raw) {
  const list = Array.isArray(raw) ? raw : [];
  return list.map((d, i) => ({
    id: `det-${i}`,
    bib: String(d?.bib_number ?? d?.bib ?? "—"),
    confidence: typeof d?.confidence === "number" ? d.confidence : 0,
    bbox: Array.isArray(d?.bbox) ? d.bbox : null, // [x, y, w, h] in pixels
  }));
}

/** Normalize a POST /detect response into the internal detection model. */
export function normalizeDetectionResponse(data) {
  return {
    filename: data?.filename ?? "upload",
    processingSeconds:
      typeof data?.processing_time === "number" ? data.processing_time : null,
    detections: mapDetections(data?.detections),
  };
}

/**
 * Normalize a persisted photo (GET /photos or /photos/{id}) into the model the
 * gallery renders. Tolerant of field-name variations across the API.
 */
export function normalizePhoto(raw) {
  if (!raw) return null;
  return {
    id: String(raw.id ?? raw._id ?? raw.photo_id ?? ""),
    cloudinaryUrl: raw.cloudinary_url ?? raw.cloudinaryUrl ?? raw.url ?? null,
    filename: raw.filename ?? "photo",
    createdAt: raw.created_at ?? raw.createdAt ?? raw.created ?? null,
    processingSeconds:
      typeof raw.processing_time === "number" ? raw.processing_time : null,
    detections: mapDetections(raw.detections),
  };
}

/** Unique bib numbers across a photo's detections, each with its best confidence. */
export function uniqueBibs(detections = []) {
  const best = new Map();
  for (const d of detections) {
    const prev = best.get(d.bib);
    if (prev == null || d.confidence > prev) best.set(d.bib, d.confidence);
  }
  return [...best.entries()].map(([bib, confidence]) => ({ bib, confidence }));
}

/**
 * Derive a Cloudinary thumbnail by inserting transformation flags right after
 * "/upload/" in the delivery URL. Returns the URL unchanged if it isn't a
 * Cloudinary upload URL.
 */
export function cloudinaryThumb(url, transform = "w_500,c_fill,q_auto,f_auto") {
  if (!url || typeof url !== "string") return url;
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/${transform}/`)
    : url;
}

/** Format a date value as "YYYY-MM-DD HH:mm", or a graceful fallback. */
export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}`
  );
}

/** Format processing seconds as a mono-friendly string, e.g. 0.42 → "0.42s". */
export function formatSeconds(seconds) {
  return seconds == null ? "—" : `${seconds.toFixed(2)}s`;
}

/**
 * Convert a pixel bbox `[x, y, w, h]` to percentages of the image's natural
 * size, so overlays stay aligned regardless of the rendered display size.
 * @returns {{x:number,y:number,w:number,h:number}|null}
 */
export function bboxToPercent(bbox, natural) {
  if (!bbox || !natural || !natural.w || !natural.h) return null;
  const [x, y, w, h] = bbox;
  return {
    x: (x / natural.w) * 100,
    y: (y / natural.h) * 100,
    w: (w / natural.w) * 100,
    h: (h / natural.h) * 100,
  };
}

/** Mean confidence (0–1) across detections, or null when there are none. */
export function averageConfidence(detections) {
  if (!detections?.length) return null;
  return detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length;
}

/** Browser-local timestamp, "YYYY-MM-DD HH:mm:ss". */
export function timestamp(date = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ` +
    `${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
  );
}
