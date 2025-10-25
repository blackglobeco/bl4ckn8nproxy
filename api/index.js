import fetch from "node-fetch";

export default async function handler(req, res) {
  const url = `https://black-n8n.onrender.com${req.url}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: { ...req.headers, host: "black-n8n.onrender.com" },
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const headers = {};
    response.headers.forEach((v, k) => {
      if (
        ![
          "content-security-policy",
          "x-frame-options",
          "strict-transport-security",
        ].includes(k.toLowerCase())
      ) {
        headers[k] = v;
      }
    });

    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Headers"] = "*";
    headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS";
    headers["X-Frame-Options"] = "ALLOWALL";

    const buffer = await response.arrayBuffer();
    res.writeHead(response.status, headers);
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed: " + err.message);
  }
}
