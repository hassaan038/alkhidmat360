/**
 * Resolve a server-relative upload path (e.g. "/uploads/qurbani/foo.jpg") to an
 * absolute URL based on the VITE_API_URL env variable. The API base typically
 * ends in "/api"; strip that to get the server origin.
 *
 * @param {string|null|undefined} path
 * @returns {string|null}
 */
export function imageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}

export default imageUrl;
