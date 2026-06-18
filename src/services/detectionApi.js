// Client for the Bib Detector backend.
// Base URL comes from VITE_API_URL (see .env.example).

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * POST an image to the detection backend.
 *
 * @param {File|Blob} file The image to analyze.
 * @returns {Promise<{filename: string, processing_time: number,
 *   detections: Array<{bib_number: string, confidence: number, bbox: number[]}>}>}
 *   The parsed JSON response. `bbox` is `[x, y, w, h]` in ORIGINAL image pixels.
 * @throws {Error} On missing config, network failure, non-2xx status, or bad JSON.
 */
export async function detectBibs(file) {
  if (!BASE_URL) {
    throw new Error(
      "VITE_API_URL is not configured. Copy .env.example to .env and set it.",
    );
  }
  if (!file) {
    throw new Error("No image file provided.");
  }

  const formData = new FormData();
  formData.append("file", file);

  let response;
  try {
    response = await fetch(`${BASE_URL}/detect`, {
      method: "POST",
      body: formData,
    });
  } catch {
    // fetch only rejects on network-level failures (server down, CORS, DNS…)
    throw new Error(
      "Could not reach the detection service. Is the backend running?",
    );
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.detail || body?.message || "";
    } catch {
      // response had no JSON body — fall back to the status text
    }
    throw new Error(
      `Detection failed (${response.status} ${response.statusText})` +
        (detail ? `: ${detail}` : ""),
    );
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Received an invalid response from the detection service.");
  }
}
