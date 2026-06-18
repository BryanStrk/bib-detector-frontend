// Mock data for the Bib Detector UI.
// Replace these with real API responses from the YOLO backend later.

/**
 * Detections for the currently-loaded photo.
 * `box` coordinates are percentages of the image (x, y = top-left corner).
 */
export const currentImage = {
  filename: "marathon_2026_finish_0421.jpg",
  resolution: "4032 × 3024",
  processingTime: "1.84s",
  detections: [
    { id: "d1", bib: "4092", confidence: 0.98, box: { x: 13, y: 26, w: 17, h: 22 } },
    { id: "d2", bib: "1187", confidence: 0.93, box: { x: 41, y: 31, w: 15, h: 20 } },
    { id: "d3", bib: "2056", confidence: 0.81, box: { x: 66, y: 24, w: 16, h: 21 } },
    { id: "d4", bib: "7734", confidence: 0.64, box: { x: 83, y: 44, w: 13, h: 18 } },
  ],
};

/**
 * System Logs start empty and fill only with real analyses from the current
 * session (see App.jsx), keeping the History view consistent with the stats
 * strip. Each appended row is one detection job:
 *   { id, timestamp, source, detectedCount, avgConfidence, processingTime, status }
 * where `avgConfidence` is the mean detection confidence (0–1) or null when
 * the job failed, and `status` is "Processed" | "Failed".
 */
export const systemLogs = [];
