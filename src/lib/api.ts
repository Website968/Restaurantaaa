export async function safeFetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  let data: any = {};

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = {};
    }
  } else {
    const text = await res.text();
    if (!res.ok) {
      if (text.startsWith('The page') || text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new Error(`API endpoint not found or server error (${res.status}). Please check API route configuration.`);
      }
      throw new Error(text || `Request failed (${res.status})`);
    }
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }

  return data;
}
