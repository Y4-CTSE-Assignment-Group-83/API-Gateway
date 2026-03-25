import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Load env FIRST
dotenv.config();

// Import proxies
import authProxy from "./src/routes/auth.proxy.js";
import bookingProxy from "./src/routes/booking.proxy.js";
import paymentProxy from "./src/routes/payment.proxy.js";
import catalogProxy from "./src/routes/catalog.proxy.js";
import staffProxy from "./src/routes/staff.proxy.js";
import staffManagementProxy from "./src/routes/staffManagement.proxy.js";
import customerProxy from "./src/routes/customer.proxy.js";
import customerManagementProxy from "./src/routes/customerManagement.proxy.js";

const app = express();
const PORT = process.env.PORT || 4000;

/* ===========================
   MIDDLEWARES
=========================== */

app.use(
  cors({
    origin: "http://ctse-alb-320060941.eu-north-1.elb.amazonaws.com",
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(cookieParser());

/* ===========================
   HEALTH CHECK
=========================== */

app.get("/", (req, res) => {
  res.json({
    service: "API Gateway",
    status: "Running",
  });
});

/* ===========================
   ROUTES (PROXY)
=========================== */

app.use("/api/auth", authProxy);
app.use("/api/staff", staffProxy);
app.use("/api/staff-management", staffManagementProxy);
app.use("/api/customer", customerProxy);
app.use("/api/customer-management", customerManagementProxy);
app.use("/api/bookings", bookingProxy);
app.use("/api/payments", paymentProxy);
app.use("/api/services", catalogProxy);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});
