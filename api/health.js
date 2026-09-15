/**
 * api/health.js
 * Health check endpoint reporting configuration status and upstream connectivity.
 * Never prints or leaks the configuration value or any portion of it.
 */

function sendJson(res, statusCode, data) {
  if (res.setHeader) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  const resourceId = process.env.HDB_RESOURCE_ID;
  const isConfigured = Boolean(
    resourceId && resourceId !== 'undefined' && resourceId.trim() !== ''
  );

  // BEFORE the fetch: If HDB_RESOURCE_ID is missing or empty, return 503 naming the variable
  if (!isConfigured) {
    return sendJson(res, 503, {
      keyConfigured: false,
      upstreamAnswered: false,
      upstreamStatus: null,
      message: 'HDB_RESOURCE_ID environment variable is missing or empty',
    });
  }

  // Ping upstream datastore with a minimal query (limit=1)
  const probeUrl = new URL('https://data.gov.sg/api/action/datastore_search');
  probeUrl.searchParams.set('resource_id', resourceId.trim());
  probeUrl.searchParams.set('limit', '1');

  try {
    const response = await fetch(probeUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const upstreamStatus = response.status;
    let upstreamSuccess = false;

    if (response.ok) {
      try {
        const body = await response.json();
        upstreamSuccess = Boolean(body && body.success === true);
      } catch {
        upstreamSuccess = false;
      }
    }

    return sendJson(res, response.ok && upstreamSuccess ? 200 : 502, {
      keyConfigured: true,
      upstreamAnswered: true,
      upstreamStatus,
      ok: response.ok && upstreamSuccess,
    });
  } catch {
    // Upstream network failure / unreachable
    return sendJson(res, 502, {
      keyConfigured: true,
      upstreamAnswered: false,
      upstreamStatus: null,
      message: 'Upstream datastore at data.gov.sg is unreachable',
      ok: false,
    });
  }
}
