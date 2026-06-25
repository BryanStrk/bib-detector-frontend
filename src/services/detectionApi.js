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

/**
 * Authenticate as an admin via the OAuth2 password flow.
 *
 * The endpoint expects `application/x-www-form-urlencoded` FORM data (NOT
 * JSON) — `URLSearchParams` sets that content type and encoding for us.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>} The bearer `access_token`.
 * @throws {Error} On bad credentials, network failure, or a missing token.
 */
export async function login(username, password) {
  requireBaseUrl();

  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  let response;
  try {
    response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    throw new Error("Could not reach the auth service. Is the backend running?");
  }

  const data = await parseResponse(response);
  const accessToken = data?.access_token;
  if (!accessToken) {
    throw new Error("Login succeeded but no access token was returned.");
  }
  return accessToken;
}

/** Raised when a protected request is rejected with 401 (token expired). */
export class SessionExpiredError extends Error {
  constructor(message = "Your session expired. Please log in again.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

/**
 * Delete a persisted photo (and its stored image). Admin only.
 *
 * @param {string|number} id
 * @param {string} token The admin bearer token.
 * @throws {SessionExpiredError} On 401 (token missing/expired).
 * @throws {Error} On other non-2xx statuses or network failure.
 */
export async function deletePhoto(id, token) {
  requireBaseUrl();

  let response;
  try {
    response = await fetch(`${BASE_URL}/photos/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Could not reach the photo service. Is the backend running?");
  }

  if (response.status === 401) {
    throw new SessionExpiredError();
  }
  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody?.detail || errBody?.message || "";
    } catch {
      // no JSON body — fall back to the status text
    }
    throw new Error(
      `Could not delete the photo (${response.status} ${response.statusText})` +
        (detail ? `: ${detail}` : ""),
    );
  }
}

// ───────────────────────── Runner claim flow ─────────────────────────
// Public photo-claim journey: pick an event + bib + email, verify the
// emailed magic link, then browse your own photos with a runner token.

/**
 * Fetch the list of public events for the claim form.
 * @returns {Promise<Array<{id:string|number, name:string, slug:string,
 *   event_date:string, participant_count:number}>>}
 */
export async function getEvents() {
  return getJson(
    "/events",
    "Could not reach the events service. Is the backend running?",
  );
}

/**
 * Request a photo claim. The backend always responds neutrally (202) whether
 * or not the details match, so we never reveal a match — the caller shows a
 * fixed neutral message.
 *
 * @param {{eventId: string|number, bibNumber: string, email: string}} params
 * @throws {Error} On network failure or a non-2xx (e.g. validation) status.
 */
export async function requestClaim({ eventId, bibNumber, email }) {
  requireBaseUrl();

  let response;
  try {
    response = await fetch(`${BASE_URL}/claims`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: eventId,
        bib_number: bibNumber,
        email,
      }),
    });
  } catch {
    throw new Error("Could not reach the claims service. Is the backend running?");
  }

  // 202 is neutral and may carry no JSON body — don't insist on one. Only
  // surface true failures (validation, server errors) using the shared style.
  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody?.detail || errBody?.message || "";
    } catch {
      // no JSON body — fall back to the status text
    }
    throw new Error(
      `Request failed (${response.status} ${response.statusText})` +
        (detail ? `: ${detail}` : ""),
    );
  }
}

/**
 * Verify an emailed claim link and exchange its token for a runner session.
 *
 * @param {string} token The single-use token from the `?token=` query param.
 * @returns {Promise<string>} The runner bearer `access_token`.
 * @throws {Error} "Invalid or expired link" on 400/401 or a missing token.
 */
export async function verifyClaim(token) {
  requireBaseUrl();

  let response;
  try {
    response = await fetch(`${BASE_URL}/claims/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch {
    throw new Error(
      "Could not reach the verification service. Is the backend running?",
    );
  }

  if (response.status === 400 || response.status === 401) {
    throw new Error("Invalid or expired link");
  }

  const data = await parseResponse(response);
  const accessToken = data?.access_token;
  if (!accessToken) {
    throw new Error("Invalid or expired link");
  }
  return accessToken;
}

/**
 * Fetch the signed-in runner's own photos. Detections are filtered to the
 * runner's bib server-side, and `cloudinary_url` is a signed original.
 *
 * @param {string} token The runner bearer token.
 * @throws {SessionExpiredError} On 401 (token missing/expired).
 */
export async function getMyPhotos(token) {
  requireBaseUrl();

  let response;
  try {
    response = await fetch(`${BASE_URL}/me/photos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Could not reach the photo service. Is the backend running?");
  }

  if (response.status === 401) {
    throw new SessionExpiredError();
  }
  return parseResponse(response);
}
