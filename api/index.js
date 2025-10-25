import fetch from "node-fetch";

const TARGET = "https://black-n8n.onrender.com";
const PUBLIC_HOST = "https://bl4ckn8nproxy.vercel.app"; // your proxy URL (update after deploy if different)

export default async function handler(req, res) {
  try {
    const targetUrl = TARGET + req.url;

    // Forward request to the real n8n server
    const fetchOptions = {
      method: req.method,
      headers: { ...req.headers, host: new URL(TARGET).host },
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      // Read incoming body
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length) fetchOptions.body = Buffer.concat(chunks);
    }

    const upstream = await fetch(targetUrl, fetchOptions);

    // Collect response body
    const arrayBuf = await upstream.arrayBuffer();
    let body = Buffer.from(arrayBuf);

    // If HTML, rewrite absolute references so frontend uses the proxy origin
    const contentType = upstream.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      const html = body.toString("utf8")
        .split(TARGET).join(PUBLIC_HOST) // rewrite absolute URLs
        .split(new URL(TARGET).host).join(new URL(PUBLIC_HOST).host);
      body = Buffer.from(html, "utf8");
    }

    // Copy headers but remove/override ones that block embedding
    const outHeaders = {};
    upstream.headers.forEach((v, k) => {
      const lk = k.toLowerCase();
      if (
        lk === "x-frame-options" ||
        lk === "content-security-policy" ||
        lk === "content-security-policy-report-only" ||
        lk === "strict-transport-security"
      ) {
        return; // skip these
      }
      outHeaders[k] = v;
    });

    // Ensure CORS + framing allowed
    outHeaders["Access-Control-Allow-Origin"] = "*";
    outHeaders["Access-Control-Allow-Headers"] = "*";
    outHeaders["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS";
    outHeaders["X-Frame-Options"] = "ALLOWALL";

    res.writeHead(upstream.status, outHeaders);
    res.end(body);
  } catch (err) {
    console.error("Proxy error:", err);
    res.statusCode = 500;
    res.end("Proxy failed: " + err.message);
  }
}
