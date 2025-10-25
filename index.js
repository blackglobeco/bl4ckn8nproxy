import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// The URL of your n8n instance
const target = "https://black-n8n.onrender.com";

app.use(
  "/",
  createProxyMiddleware({
    target,
    changeOrigin: true,
    onProxyRes: (proxyRes) => {
      delete proxyRes.headers["x-frame-options"];
      delete proxyRes.headers["content-security-policy"];
      delete proxyRes.headers["content-security-policy-report-only"];
    },
  })
);

// Optional: simple route to verify the proxy works
app.get("/health", (req, res) => res.send("Proxy is running fine."));

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`✅ Proxy running on port ${port}`));
