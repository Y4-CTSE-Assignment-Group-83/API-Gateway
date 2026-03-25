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

    pathRewrite: (path) => {
      if (path.startsWith("/api/customer-management")) {
        return path;
      }
      return `/api/customer-management${path}`;
    },

    onProxyReq: (proxyReq, req) => {
      console.log(
        `[GATEWAY → CUSTOMER-MANAGEMENT] ${req.method} ${req.originalUrl}`,
      );

      Object.keys(req.headers).forEach((key) => {
        proxyReq.setHeader(key, req.headers[key]);
      });

      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  }),
);

export default router;
