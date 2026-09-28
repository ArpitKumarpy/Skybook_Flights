const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, { method = "GET", body, session } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (session?.token) headers.Authorization = `${session.tokenType || "Bearer"} ${session.token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return null;

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || data?.details || `Request failed with ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return data;
}

export const api = {
  publicPost: (path, body) => request(path, { method: "POST", body }),
  get: (path, session) => request(path, { session }),
  post: (path, body, session) => request(path, { method: "POST", body, session }),
  put: (path, body, session) => request(path, { method: "PUT", body, session }),
  patch: (path, body, session) => request(path, { method: "PATCH", body, session }),
  delete: (path, session) => request(path, { method: "DELETE", session }),
};

export const API_BASE_URL_EXPORT = API_BASE_URL;
