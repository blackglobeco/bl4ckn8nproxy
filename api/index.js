import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createServer } from "http";

const app = express();

// 🔗 Target: your actual n8n instance
const target = "https://black-n8n.onrender.com";

app.use(
  "/",
  createProxyMiddleware({
    target,
    changeOrigin: true,
    secure: true,
    onProxyRes: (proxyRes) => {
      // Remove security headers that block iframe embedding
      delete proxyRes.headers["x-frame-options"];
      delete proxyRes.headers["content-security-policy"];
      delete proxyRes.headers["content-security-policy-report-only"];
    },
  })
);

export default (req, res) => {
  const server = createServer(app);
  server.emit("request", req, res);
};
