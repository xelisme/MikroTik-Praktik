// Vercel serverless entry point.
// Exposes the Express app as a catch-all function so every route (including
// /api/* and static ./public) is handled by a single deployment. Static files
// are served by the Express app itself (see server.js), not by Vercel.
const app = require('../server.js');
module.exports = app;
