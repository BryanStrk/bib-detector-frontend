// Helpers for turning raw backend responses into the shape the UI renders,
// and for scaling pixel bounding boxes to layout-independent percentages.

/**
 * Normalize a POST /detect response into the internal detection model.
 * Keeps `confidence` as 0–1 (ConfidenceBar/tier logic expects that range)
 * and keeps `bbox` in original pixels for later percentage scaling.
 */
export function normalizeDetectionResponse(data) {
  const detections = Array.isArray(data?.detections) ? data.detections : [];
  return {
    filename: data?.filename ?? "upload",
    processingSeconds:
      typeof data?.processing_time === "number" ? data.processing_time : null,
    detections: detections.map((d, i) => ({
      id: `det-${i}`,
      bib: String(d?.bib_number ?? "—"),
      confidence: typeof d?.confidence === "number" ? d.confidence : 0,
      bbox: Array.isArray(d?.bbox) ? d.bbox : null, // [x, y, w, h] in pixels
    })),
  };
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
