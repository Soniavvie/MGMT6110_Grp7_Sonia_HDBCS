/**
 * api/comparables.js
 * Serverless function for fetching HDB resale flat comparable sales from data.gov.sg.
 */

function sendJson(res, statusCode, data) {
  if (res.setHeader) {
    res.setHeader('Content-Type', 'application/json');
  }
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

function getQueryParams(req) {
  if (req.query && typeof req.query === 'object') {
    return req.query;
  }
  try {
    const parsedUrl = new URL(req.url, 'http://localhost');
    return Object.fromEntries(parsedUrl.searchParams.entries());
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  // Enforce Cache-Control header matching data change frequency (24h cache, 48h stale-while-revalidate)
  if (res.setHeader) {
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800');
  }

  // 1. BEFORE the fetch: Check if HDB_RESOURCE_ID is missing or empty or 'undefined'
  const resourceId = process.env.HDB_RESOURCE_ID;
  if (!resourceId || resourceId === 'undefined' || resourceId.trim() === '') {
    return sendJson(res, 503, {
      error: 'HDB_RESOURCE_ID environment variable is missing or empty. Upstream datastore query aborted.',
    });
  }

  // 2. Parse and validate query parameters
  const query = getQueryParams(req);
  const town = query.town || query.townName;
  const flatType = query.flatType || query.flat_type;
  const streetName = query.streetName || query.street_name;

  if (!town || !flatType) {
    return sendJson(res, 400, {
      error: 'Missing required query parameters: town and flatType must be provided to filter comparable sales.',
    });
  }

  // 3. Uppercase query parameters and build filters object
  const filters = {
    town: String(town).trim().toUpperCase(),
    flat_type: String(flatType).trim().toUpperCase(),
  };

  if (streetName && String(streetName).trim()) {
    filters.street_name = String(streetName).trim().toUpperCase();
  }

  // Cap limit at 2000 to prevent large dataset downloads
  let limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit <= 0 || limit > 2000) {
    limit = 2000;
  }

  // 4. Build upstream URL with URL-encoded filters JSON
  const upstreamUrl = new URL('https://data.gov.sg/api/action/datastore_search');
  upstreamUrl.searchParams.set('resource_id', resourceId.trim());
  upstreamUrl.searchParams.set('filters', JSON.stringify(filters));
  upstreamUrl.searchParams.set('limit', String(limit));

  let response;
  try {
    response = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch {
    // Upstream network failure / unreachable
    return sendJson(res, 502, {
      upstreamStatus: null,
      reason: 'Upstream datastore at data.gov.sg is unreachable',
    });
  }

  // 5. AFTER the fetch: check response.ok before reading the body
  if (!response.ok) {
    let reason = response.statusText || 'Upstream request failed';
    try {
      const text = await response.text();
      if (text) {
        const cleaned = text.slice(0, 160).replace(/\r?\n/g, ' ').trim();
        if (cleaned) {
          reason = cleaned;
        }
      }
    } catch {
      // Body reading failed or was empty on refusal
    }

    return sendJson(res, response.status, {
      upstreamStatus: response.status,
      reason: `Upstream error (${response.status}): ${reason}`,
    });
  }

  // 6. Safely parse JSON and verify {"success": true}
  let payload;
  try {
    payload = await response.json();
  } catch {
    return sendJson(res, 502, {
      upstreamStatus: response.status,
      reason: 'Upstream returned invalid non-JSON body despite HTTP 200',
    });
  }

  if (!payload || payload.success === false) {
    const errorMsg =
      (payload && payload.error && (payload.error.message || payload.error.__type)) ||
      'Upstream datastore returned refusal status';
    return sendJson(res, 502, {
      upstreamStatus: response.status,
      reason: `Upstream refusal: ${errorMsg}`,
    });
  }

  // 7. Filter and transform records - only returning requested fields
  const rawRecords =
    payload.result && Array.isArray(payload.result.records) ? payload.result.records : [];

  const records = rawRecords.map((r) => ({
    month: r.month != null ? String(r.month) : '',
    town: r.town != null ? String(r.town) : '',
    flat_type: r.flat_type != null ? String(r.flat_type) : '',
    block: r.block != null ? String(r.block) : '',
    street_name: r.street_name != null ? String(r.street_name) : '',
    storey_range: r.storey_range != null ? String(r.storey_range) : '',
    floor_area_sqm: Number(r.floor_area_sqm) || 0,
    remaining_lease: r.remaining_lease != null ? String(r.remaining_lease) : '',
    resale_price: Number(r.resale_price) || 0,
  }));

  return sendJson(res, 200, {
    count: records.length,
    records,
  });
}
