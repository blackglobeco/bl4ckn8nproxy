import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// Replace with your actual n8n Render URL
const TARGET = "https://black-n8n.onrender.com";

app.use(
  "/",
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    onProxyRes: (proxyRes) => {
      // Remove headers that block iframe embedding
      delete proxyRes.headers["x-frame-options"];
      delete proxyRes.headers["content-security-policy"];
      delete proxyRes.headers["cross-origin-opener-policy"];
      delete proxyRes.headers["cross-origin-embedder-policy"];
    },
  })
);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`✅ Proxy running on http://localhost:${PORT}`)
);
