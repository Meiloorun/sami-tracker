type ApiFetchOptions = {
  allowNetworkFallback?: boolean;
};

const REMOTE_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL) || "http://localhost:3000";
const LOCAL_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_LOCAL_URL);
const HEALTH_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_LOCAL_HEALTH_TIMEOUT_MS || "900");
const DEBUG_API_ROUTING = String(process.env.EXPO_PUBLIC_API_DEBUG || "").toLowerCase() === "true";
const RESOLVE_TTL_MS = 30_000;

let cachedBaseUrl: string | null = null;
let cachedAt = 0;

function normalizeBaseUrl(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, "");
}

function withLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function isLikelyNetworkError(error: unknown): boolean {
  return error instanceof TypeError || error instanceof DOMException;
}

async function pingHealth(baseUrl: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    if (DEBUG_API_ROUTING) {
      console.info(`[api] health ${baseUrl}/health -> ${res.status}`);
    }
    return res.ok;
  } catch {
    if (DEBUG_API_ROUTING) {
      console.info(`[api] health ${baseUrl}/health -> failed`);
    }
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveBaseUrl(): Promise<string> {
  if (!LOCAL_BASE_URL) {
    cachedBaseUrl = REMOTE_BASE_URL;
    cachedAt = Date.now();
    return REMOTE_BASE_URL;
  }

  const now = Date.now();
  if (cachedBaseUrl && now - cachedAt < RESOLVE_TTL_MS) {
    return cachedBaseUrl;
  }

  const localHealthy = await pingHealth(LOCAL_BASE_URL);
  cachedBaseUrl = localHealthy ? LOCAL_BASE_URL : REMOTE_BASE_URL;
  cachedAt = now;
  if (DEBUG_API_ROUTING) {
    console.info(`[api] selected base: ${cachedBaseUrl}`);
  }
  return cachedBaseUrl;
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions,
): Promise<Response> {
  const route = withLeadingSlash(path);
  const allowNetworkFallback = options?.allowNetworkFallback ?? false;
  const primaryBase = await resolveBaseUrl();

  try {
    if (DEBUG_API_ROUTING) {
      console.info(`[api] ${init?.method || "GET"} ${primaryBase}${route}`);
    }
    return await fetch(`${primaryBase}${route}`, init);
  } catch (error) {
    if (
      !!LOCAL_BASE_URL &&
      primaryBase === LOCAL_BASE_URL &&
      REMOTE_BASE_URL !== LOCAL_BASE_URL &&
      isLikelyNetworkError(error)
    ) {
      cachedBaseUrl = REMOTE_BASE_URL;
      cachedAt = Date.now();
    }

    const canFallback =
      allowNetworkFallback &&
      !!LOCAL_BASE_URL &&
      primaryBase === LOCAL_BASE_URL &&
      REMOTE_BASE_URL !== LOCAL_BASE_URL &&
      isLikelyNetworkError(error);

    if (!canFallback) throw error;

    cachedBaseUrl = REMOTE_BASE_URL;
    cachedAt = Date.now();
    if (DEBUG_API_ROUTING) {
      console.info(`[api] fallback to remote: ${REMOTE_BASE_URL}${route}`);
    }
    return fetch(`${REMOTE_BASE_URL}${route}`, init);
  }
}
