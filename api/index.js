import { createProxyMiddleware } from "http-proxy-middleware";

const proxy = createProxyMiddleware({
  target: "https://black-n8n.onrender.com",
  changeOrigin: true,
  secure: false,
  onProxyRes(proxyRes) {
    // Remove headers that block iframe embedding
    delete proxyRes.headers["x-frame-options"];
    delete proxyRes.headers["content-security-policy"];

    // Add permissive CORS for iframe & API requests
    proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    proxyRes.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS";
    proxyRes.headers["Access-Control-Allow-Headers"] = "*";
  },
  pathRewrite: { "^/": "/" },
});

export default function handler(req, res) {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    return res.status(200).end();
  }

  proxy(req, res, (err) => {
    if (err) {
      console.error("Proxy error:", err);
      res.status(500).send("Proxy Error");
    }
  });
}
