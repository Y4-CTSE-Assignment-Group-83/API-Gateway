import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.use(
  "/",
  createProxyMiddleware({
    target: process.env.CATALOG_SERVICE_URL,
    changeOrigin: true,
    secure: false,
    cookieDomainRewrite: "",

    // 🔥 Conditional rewrite (UNCHANGED)
    pathRewrite: (path, req) => {
      //  DO NOT rewrite uploads
      if (path.startsWith("/uploads")) {
        return path;
      }

      // Prevent double prefix
      if (path.startsWith("/api/services")) {
        return path;
      }

      //  Rewrite only when needed
      return `/api/services${path}`;
    },

    //  Auth part REMOVED here
    // onProxyReq: (proxyReq, req) => {
    //   console.log(`[GATEWAY → CATALOG] ${req.method} ${req.originalUrl}`);
    //   // Auth part added here
    //   if (req.headers.authorization) {
    //     proxyReq.setHeader("Authorization", req.headers.authorization);
    //   }
    // },

    onProxyReq: (proxyReq, req) => {
      console.log("[GATEWAY → CATALOG] ${req.method} ${req.originalUrl}");

      // 🔥 VERY IMPORTANT: forward ALL headers
      Object.keys(req.headers).forEach((key) => {
        proxyReq.setHeader(key, req.headers[key]);
      });

      // 🔥 Handle body (for POST/PUT)
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },

    onProxyRes: (proxyRes) => {
      console.log(`[CATALOG RESPONSE] Status: ${proxyRes.statusCode}`);
    },

    onError: (err, req, res) => {
      console.error("Proxy Error (Catalog):", err.message);

      res.status(500).json({
        message: "Catalog Service unavailable",
      });
    },
  }),
);

export default router;
