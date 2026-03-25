import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { createProxyMiddleware } from "http-proxy-middleware";

const router = express.Router();

router.use(
  "/",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    secure: false,
    cookieDomainRewrite: "",

    // 🔥 FIX: DO NOT rewrite paths
    pathRewrite: (path) => path,

    onProxyReq: (proxyReq, req) => {
      console.log(`[GATEWAY → AUTH] ${req.method} ${req.originalUrl}`);

      // Pass headers
      Object.keys(req.headers).forEach((key) => {
        proxyReq.setHeader(key, req.headers[key]);
      });

      // Handle body (for POST/PUT)
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },

    onProxyRes: (proxyRes) => {
      console.log(`[AUTH RESPONSE] Status: ${proxyRes.statusCode}`);
    },

    onError: (err, req, res) => {
      console.error("Proxy Error (Auth):", err.message);

      res.status(502).json({
        message: "Auth Service Gateway Error",
      });
    },
  }),
);

export default router;