// Mock data for the Bib Detector UI.
// Replace these with real API responses from the YOLO backend later.

/**
 * Detections for the currently-loaded photo.
 * `box` coordinates are percentages of the image (x, y = top-left corner).
 */
export const currentImage = {
  filename: "race_finish_demo.jpg",
  resolution: "1300 × 731",
  processingTime: "1.84s",
  detections: [
    { id: "d1", bib: "462", confidence: 0.97, box: { x: 40, y: 37, w: 7, h: 11 } },
    { id: "d2", bib: "745", confidence: 0.71, box: { x: 57, y: 51, w: 4, h: 8 } },
    { id: "d3", bib: "820", confidence: 0.92, box: { x: 66, y: 37, w: 5, h: 10 } },
    { id: "d4", bib: "951", confidence: 0.85, box: { x: 78, y: 30, w: 5, h: 9 } },
    { id: "d5", bib: "154", confidence: 0.68, box: { x: 91, y: 38, w: 5, h: 9 } },
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
