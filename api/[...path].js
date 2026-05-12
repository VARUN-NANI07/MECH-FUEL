const BACKEND_BASE_URL = process.env.RENDER_API_URL || 'https://mech-fuel.onrender.com';

const copyHeaders = (headers) => {
  const forwarded = {};

  for (const [key, value] of Object.entries(headers)) {
    if (
      ['host', 'content-length', 'connection', 'accept-encoding'].includes(key.toLowerCase())
    ) {
      continue;
    }

    forwarded[key] = value;
  }

  return forwarded;
};

async function handler(req, res) {
  const pathSegments = Array.isArray(req.query.path)
    ? req.query.path
    : typeof req.query.path === 'string'
      ? [req.query.path]
      : [];

  const targetUrl = new URL(`${BACKEND_BASE_URL}/api/${pathSegments.join('/')}`);

  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'path') {
      targetUrl.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
    }
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.status(204).end();
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: copyHeaders(req.headers),
      body: ['GET', 'HEAD'].includes(req.method)
        ? undefined
        : typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body ?? {}),
    });

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      res.json(data);
      return;
    }

    const text = await response.text();
    res.send(text);
  } catch (error) {
    res.status(502).json({
      success: false,
      error: 'Proxy request failed',
      details: error.message,
    });
  }
}

module.exports = handler;
