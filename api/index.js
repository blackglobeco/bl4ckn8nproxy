import { createProxyMiddleware } from "http-proxy-middleware";

const proxy = createProxyMiddleware({
  target: "https://black-n8n.onrender.com",
  changeOrigin: true,
  secure: false,
  onProxyRes: (proxyRes) => {
    delete proxyRes.headers["x-frame-options"];
    delete proxyRes.headers["content-security-policy"];
  },
  pathRewrite: { "^/": "/" },
});

export default function handler(req, res) {
  proxy(req, res, (err) => {
    if (err) {
      res.status(500).send("Proxy error");
    }
  });
}
