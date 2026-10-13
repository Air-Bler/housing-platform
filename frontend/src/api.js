// Κοινή πρόσβαση στο backend.
// Το backend απαντά σε αποτυχία με HTTP 4xx/5xx και σώμα {"error": {"code", "message", "details"?}}.

export const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Πρέπει να ταιριάζουν με τα όρια του backend (backend/app/config.py).
export const IMAGE_LIMITS = {
  maxImages: 6,
  maxImageBytes: 8 * 1024 * 1024,
  maxTotalBytes: 25 * 1024 * 1024,
  types: ['image/jpeg', 'image/png', 'image/webp'],
};

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details || [];
  }
}

const NETWORK_MESSAGE = 'Δεν ήταν δυνατή η σύνδεση με τον server. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.';

export async function apiFetch(path, options) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_MESSAGE);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body && body.error;
    throw new ApiError(
      res.status,
      (err && err.code) || 'HTTP_ERROR',
      (err && err.message) || `Σφάλμα API (${res.status})`,
      err && err.details
    );
  }
  return body;
}

export const postJson = (path, data) =>
  apiFetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

export const postForm = (path, formData) => apiFetch(path, { method: 'POST', body: formData });

// Επιστρέφει { accepted, rejected } με μήνυμα για κάθε αρχείο που δεν γίνεται δεκτό.
export function checkImages(existing, incoming) {
  const accepted = [];
  const rejected = [];
  let total = existing.reduce((sum, f) => sum + f.size, 0);

  for (const file of incoming) {
    if (!IMAGE_LIMITS.types.includes(file.type)) {
      rejected.push(`«${file.name}»: υποστηρίζονται μόνο JPEG, PNG και WEBP.`);
    } else if (file.size > IMAGE_LIMITS.maxImageBytes) {
      rejected.push(`«${file.name}»: ξεπερνά τα ${IMAGE_LIMITS.maxImageBytes / 1024 / 1024} MB.`);
    } else if (existing.length + accepted.length >= IMAGE_LIMITS.maxImages) {
      rejected.push(`Έως ${IMAGE_LIMITS.maxImages} φωτογραφίες· το «${file.name}» δεν προστέθηκε.`);
    } else if (total + file.size > IMAGE_LIMITS.maxTotalBytes) {
      rejected.push(`«${file.name}»: το συνολικό μέγεθος ξεπερνά τα ${IMAGE_LIMITS.maxTotalBytes / 1024 / 1024} MB.`);
    } else {
      accepted.push(file);
      total += file.size;
    }
  }
  return { accepted, rejected };
}
