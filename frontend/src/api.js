const API = 'http://localhost:5000';

export const apiUrl = (path) => `${API}${path.startsWith('/') ? path : `/${path}`}`;

export async function fetchJson(path, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }
  return data;
}
