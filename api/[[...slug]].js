// Vercel serverless entry point.
// Exposes the Express app as a catch-all function so every route (including
// /api/*) is handled by a single deployment. Static files in ./public are served
// by Vercel automatically; this function only handles dynamic routes.
const app = require('../server.js');
module.exports = app;
