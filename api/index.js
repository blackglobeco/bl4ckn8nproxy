import { createProxyMiddleware } from "http-proxy-middleware";
import { Buffer } from "buffer";

const target = "https://black-n8n.onrender.com"; // your actual n8n URL

const proxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  selfHandleResponse: true,
  onProxyRes: async (proxyRes, req, res) => {
    const chunks = [];
    proxyRes.on("data", (chunk) => chunks.push(chunk));
    proxyRes.on("end", () => {
      let body = Buffer.concat(chunks);
      const contentType = proxyRes.headers["content-type"] || "";

      // Rewrite links in HTML
      if (contentType.includes("text/html")) {
        body = body
          .toString("utf8")
          .replaceAll(target, "https://black-n8n-proxy.vercel.app");
      }

      // Remove blocking headers
      delete proxyRes.headers["x-frame-options"];
      delete proxyRes.headers["content-security-policy"];
      delete proxyRes.headers["cross-origin-opener-policy"];
      delete proxyRes.headers["cross-origin-embedder-policy"];
      delete proxyRes.headers["cross-origin-resource-policy"];

      // Allow embedding + CORS
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

      // Copy all other headers
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        if (value) res.setHeader(key, value);
      }

      res.statusCode = proxyRes.statusCode;
      res.end(body);
    });
  },
});

export default function handler(req, res) {
  proxy(req, res, (err) => {
    if (err) res.status(500).send("Proxy error: " + err.message);
  });
}
