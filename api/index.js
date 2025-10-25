import https from "https";
import http from "http";

export default async function handler(req, res) {
  const target = "https://black-n8n.onrender.com"; // change if needed
  const url = new URL(req.url, target);

  const client = url.protocol === "https:" ? https : http;

  const proxyReq = client.request(
    url,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: url.host,
      },
    },
    (proxyRes) => {
      // remove headers that block iframe
      delete proxyRes.headers["x-frame-options"];
      delete proxyRes.headers["content-security-policy"];
      delete proxyRes.headers["content-security-policy-report-only"];

      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  req.pipe(proxyReq, { end: true });

  proxyReq.on("error", (err) => {
    console.error("Proxy error:", err);
    res.statusCode = 500;
    res.end("Proxy failed: " + err.message);
  });
}
