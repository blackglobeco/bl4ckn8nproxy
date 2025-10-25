import { createProxyMiddleware } from "http-proxy-middleware";

const proxy = createProxyMiddleware({
  target: "https://black-n8n.onrender.com",
  changeOrigin: true,
  secure: false,
  onProxyRes: (proxyRes) => {
    // Remove headers that block embedding
    delete proxyRes.headers["x-frame-options"];
    delete proxyRes.headers["content-security-policy"];
    delete proxyRes.headers["cross-origin-opener-policy"];
    delete proxyRes.headers["cross-origin-embedder-policy"];
    delete proxyRes.headers["cross-origin-resource-policy"];

    // Allow embedding everywhere
    proxyRes.headers["access-control-allow-origin"] = "*";
    proxyRes.headers["access-control-allow-headers"] = "*";
    proxyRes.headers["access-control-allow-methods"] = "GET,POST,PUT,DELETE,OPTIONS";
  },
  pathRewrite: { "^/": "/" },
});

export default function handler(req, res) {
  proxy(req, res, (err) => {
    if (err) res.status(500).send("Proxy error");
  });
}
