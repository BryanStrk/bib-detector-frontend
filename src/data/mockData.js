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
  model: "YOLOv8-bib · v3.2",
  detections: [
    { id: "d1", bib: "4092", confidence: 0.98, box: { x: 13, y: 26, w: 17, h: 22 } },
    { id: "d2", bib: "1187", confidence: 0.93, box: { x: 41, y: 31, w: 15, h: 20 } },
    { id: "d3", bib: "2056", confidence: 0.81, box: { x: 66, y: 24, w: 16, h: 21 } },
    { id: "d4", bib: "7734", confidence: 0.64, box: { x: 83, y: 44, w: 13, h: 18 } },
  ],
};

/**
 * Full-width system log table rows — one row per detection job.
 * `avgConfidence` is the mean across the job's detections (0–1), or null
 * when the job failed. `status` is "Processed" | "Failed".
 */
export const systemLogs = [
  {
    id: "l1",
    timestamp: "2026-06-17 14:32:08",
    source: "marathon_2026_finish_0421.jpg",
    detectedCount: 4,
    avgConfidence: 0.84,
    processingTime: "1.84s",
    status: "Processed",
  },
  {
    id: "l2",
    timestamp: "2026-06-17 14:31:55",
    source: "marathon_2026_finish_0418.jpg",
    detectedCount: 2,
    avgConfidence: 0.95,
    processingTime: "1.62s",
    status: "Processed",
  },
  {
    id: "l3",
    timestamp: "2026-06-17 14:31:40",
    source: "trail_run_split_0067.jpg",
    detectedCount: 3,
    avgConfidence: 0.79,
    processingTime: "2.07s",
    status: "Processed",
  },
  {
    id: "l4",
    timestamp: "2026-06-17 14:30:58",
    source: "cyclocross_lap3_0203.jpg",
    detectedCount: 0,
    avgConfidence: null,
    processingTime: "1.45s",
    status: "Failed",
  },
  {
    id: "l5",
    timestamp: "2026-06-17 14:30:31",
    source: "cyclocross_lap3_0201.jpg",
    detectedCount: 5,
    avgConfidence: 0.91,
    processingTime: "1.39s",
    status: "Processed",
  },
  {
    id: "l6",
    timestamp: "2026-06-17 14:29:47",
    source: "10k_city_start_0009.jpg",
    detectedCount: 1,
    avgConfidence: 0.84,
    processingTime: "1.91s",
    status: "Processed",
  },
];

/** Top-line stats shown as a strip under the navbar. */
export const stats = [
  { id: "s1", label: "Photos Processed", value: "1,248" },
  { id: "s2", label: "Bibs Detected", value: "9,532" },
  { id: "s3", label: "Avg Confidence", value: "91.4%" },
  { id: "s4", label: "Avg Latency", value: "1.78s" },
];
