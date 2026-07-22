const renderApiHost = import.meta.env.VITE_API_HOST;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  || (renderApiHost ? `https://${renderApiHost}/api/v1` : 'http://localhost:8080/api/v1')).replace(/\/$/, '');

export async function apiRequest(path, options = {}) {
  return request(path, options, true);
}

export async function apiDownload(path) {
  return download(path, true);
}

async function request(path, options = {}, allowRefresh = true) {
  const savedUser = localStorage.getItem('burger_auth_user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const accessToken = currentUser?.accessToken || currentUser?.token;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => null);
  if (response.status === 401 && allowRefresh && currentUser?.refreshToken && path !== '/auth/refresh') {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentUser.refreshToken }),
    });
    const refreshPayload = await refreshResponse.json().catch(() => null);
    if (refreshResponse.ok && refreshPayload?.data?.accessToken) {
      localStorage.setItem('burger_auth_user', JSON.stringify({
        ...currentUser,
        accessToken: refreshPayload.data.accessToken,
        refreshToken: refreshPayload.data.refreshToken,
        expiresIn: refreshPayload.data.expiresIn,
        tokenType: refreshPayload.data.tokenType,
      }));
      return request(path, options, false);
    }
  }
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }
  return payload?.data;
}

export function toQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const encoded = query.toString();
  return encoded ? `?${encoded}` : '';
}

async function download(path, allowRefresh) {
  const savedUser = localStorage.getItem('burger_auth_user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const accessToken = currentUser?.accessToken || currentUser?.token;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/octet-stream,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  if (response.status === 401 && allowRefresh && currentUser?.refreshToken) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentUser.refreshToken }),
    });
    const refreshPayload = await refreshResponse.json().catch(() => null);
    if (refreshResponse.ok && refreshPayload?.data?.accessToken) {
      localStorage.setItem('burger_auth_user', JSON.stringify({
        ...currentUser,
        accessToken: refreshPayload.data.accessToken,
        refreshToken: refreshPayload.data.refreshToken,
        expiresIn: refreshPayload.data.expiresIn,
        tokenType: refreshPayload.data.tokenType,
      }));
      return download(path, false);
    }
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || `Download failed with status ${response.status}`);
  }
  const disposition = response.headers.get('Content-Disposition') || '';
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || 'burgerburst-report';
  return { blob: await response.blob(), filename };
}
