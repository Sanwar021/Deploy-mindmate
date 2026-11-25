import app from '../software/server/index.js';

export default function handler(req, res) {
  const queryIndex = req.url.indexOf('?');
  const rawQuery = queryIndex >= 0 ? req.url.slice(queryIndex + 1) : '';
  const params = new URLSearchParams(rawQuery);
  const rewrittenPath = req.query?.__path ?? params.get('__path');

  if (rewrittenPath !== null && rewrittenPath !== undefined) {
    const pathPart = Array.isArray(rewrittenPath)
      ? rewrittenPath.join('/')
      : String(rewrittenPath);
    params.delete('__path');
    const qs = params.toString();
    req.url = `/api/${pathPart.replace(/^\/+/, '')}${qs ? `?${qs}` : ''}`;
  }

  return app(req, res);
}
