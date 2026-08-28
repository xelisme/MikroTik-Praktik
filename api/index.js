// Vercel serverless entry point.
// Exposes the Express app as the api/index.js function. A vercel.json rewrite
// sends EVERY request (including deep paths like /api/scenarios/generate) here,
// preserving the original URL so Express can route it. (Vercel's optional
// catch-all api/[[...slug]].js does NOT reliably match multi-segment paths and
// returns its own 404 for them — hence the rewrite approach.)
const app = require('../server.js');
module.exports = app;
