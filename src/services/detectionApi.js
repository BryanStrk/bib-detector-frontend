// Client for the Bib Detector backend.
// Base URL comes from VITE_API_URL (see .env.example).

const BASE_URL = import.meta.env.VITE_API_URL;

function requireBaseUrl() {
  if (!BASE_URL) {
    throw new Error(
      "VITE_API_URL is not configured. Copy .env.example to .env and set it.",
    );
  }
}

/** Shared response handling: surface a clean error, otherwise parse JSON. */
async function parseResponse(response) {
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.detail || body?.message || "";
    } catch {
      // response had no JSON body — fall back to the status text
    }
    throw new Error(
      `Request failed (${response.status} ${response.statusText})` +
        (detail ? `: ${detail}` : ""),
    );
  }
  try {
    return await response.json();
  } catch {
    throw new Error("Received an invalid response from the server.");
  }
}

/** GET helper with the same error-handling style as detectBibs. */
async function getJson(path, networkMessage) {
  requireBaseUrl();
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`);
  } catch {
    throw new Error(networkMessage);
  }
  return parseResponse(response);
}

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
  requireBaseUrl();
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
  return parseResponse(response);
}

/**
 * Fetch persisted photos from the detection history.
 *
 * @param {{bibNumber?: string, limit?: number, offset?: number}} [params]
 * @returns {Promise<object>} Raw response — an array of photos or a paged
 *   envelope like `{ photos: [...] }` (the caller normalizes it).
 */
export async function getPhotos({ bibNumber, limit, offset } = {}) {
  const params = new URLSearchParams();
  if (bibNumber) params.set("bib_number", bibNumber);
  if (limit != null) params.set("limit", String(limit));
  if (offset != null) params.set("offset", String(offset));
  const qs = params.toString();
  return getJson(
    `/photos${qs ? `?${qs}` : ""}`,
    "Could not reach the photo service. Is the backend running?",
  );
}

/**
 * Fetch a single persisted photo (with its detections) by id.
 * @param {string|number} id
 */
export async function getPhoto(id) {
  return getJson(
    `/photos/${encodeURIComponent(id)}`,
    "Could not reach the photo service. Is the backend running?",
  );
}
