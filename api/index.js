import https from "https";
import http from "http";

export default async function handler(req, res) {
  const target = "https://black-n8n.onrender.com"; // your n8n instance
  const url = new URL(req.url, target);
  const client = url.protocol === "https:" ? https : http;

  // Add your Basic Auth credentials
  const authUser = "user@blackglobe.io"; // 👈 change this
  const authPass = "BID12345"; // 👈 change this

  const proxyReq = client.request(
    url,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: url.host,
        authorization:
          "Basic " + Buffer.from(`${authUser}:${authPass}`).toString("base64"),
      },
    },
    (proxyRes) => {
      // ✅ Remove headers that block embedding
      delete proxyRes.headers["x-frame-options"];
      delete proxyRes.headers["content-security-policy"];
      delete proxyRes.headers["content-security-policy-report-only"];

      // ✅ Add headers to allow iframe and CORS
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
      );
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("X-Frame-Options", "ALLOWALL");

      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  // Handle request body and errors
  req.pipe(proxyReq, { end: true });

  proxyReq.on("error", (err) => {
    console.error("Proxy error:", err);
    res.statusCode = 500;
    res.end("Proxy failed: " + err.message);
  });
}
