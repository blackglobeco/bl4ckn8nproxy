import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Proxy all requests to your n8n instance
app.use("/", async (req, res) => {
  try {
    const url = `https://black-n8n.onrender.com${req.originalUrl}`;
    const response = await fetch(url, {
      method: req.method,
      headers: { ...req.headers, host: "black-n8n.onrender.com" },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    // Clone headers & modify security restrictions
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

    // Always allow embedding and CORS
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Headers"] = "*";
    headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS";
    headers["X-Frame-Options"] = "ALLOWALL";

    const buffer = await response.arrayBuffer();
    res.writeHead(response.status, headers);
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed");
  }
});

app.listen(3000, () => console.log("Proxy running on port 3000"));
export default app;
