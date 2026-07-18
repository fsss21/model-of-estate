/**
 * CMS document loader with fallback to /data/*.json
 * Project: model-of-estate
 */
const PROJECT_ID = 'model-of-estate';

function cmsBase() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CMS_URL) {
      return import.meta.env.VITE_CMS_URL;
    }
  } catch {
    /* ignore */
  }
  // Dev default: CMS on :3333 (CORS enabled). Offline kiosks fall back to /data/*.json.
  return 'http://127.0.0.1:3333';
}

export async function fetchDocument(documentKey, localPath) {
  const local = localPath || `/data/${documentKey}.json`;
  const base = cmsBase();
  const publicUrl = `${base}/api/public/projects/${encodeURIComponent(PROJECT_ID)}/documents/${encodeURIComponent(documentKey)}`;

  try {
    const res = await fetch(publicUrl, { headers: { Accept: 'application/json' } });
    if (res.ok) return await res.json();
  } catch {
    // CMS unavailable — use local JSON
  }

  const localRes = await fetch(local);
  if (!localRes.ok) throw new Error(`Failed to load ${documentKey}`);
  return localRes.json();
}

/**
 * Drop-in for fetch('/data/foo.json') — returns a Response-like object with .ok and .json().
 * Supports AbortSignal via options.signal (aborts local fallback only if already aborted).
 */
export function fetchData(pathOrUrl, options = {}) {
  const raw = String(pathOrUrl);
  const name = raw.replace(/^\/?data\//, '').replace(/\.json$/i, '').replace(/^\//, '');
  const localPath = raw.startsWith('/') ? raw : `/data/${name}.json`;

  const promise = (async () => {
    if (options.signal?.aborted) {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      throw err;
    }
    const data = await fetchDocument(name, localPath);
    return {
      ok: true,
      status: 200,
      json: async () => data,
      text: async () => JSON.stringify(data),
    };
  })();

  return promise;
}

export async function fetchDataJson(filenameOrPath) {
  const name = String(filenameOrPath).replace(/^\/?data\//, '').replace(/\.json$/i, '');
  return fetchDocument(name, `/data/${name}.json`);
}

export default fetchDocument;
