import fetch from "node-fetch";

export default async function handler(req, res) {
  const target = "https://black-n8n.onrender.com"; // your n8n instance URL
  const url = `${target}${req.url}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        ...Object.fromEntries(
          Object.entries(req.headers).filter(
            ([key]) =>
              !["host", "x-forwarded-for", "x-real-ip"].includes(key.toLowerCase())
          )
        ),
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    // Copy headers except the frame blockers
    const headers = {};
    response.headers.forEach((value, key) => {
      if (
        !["x-frame-options", "content-security-policy", "content-security-policy-report-only"].includes(
          key.toLowerCase()
        )
      ) {
        headers[key] = value;
      }
    });

    res.writeHead(response.status, headers);
    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send(`Proxy error: ${err.message}`);
  }
}
