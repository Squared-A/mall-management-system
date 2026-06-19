// Express app setup
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import env from "./config/env.js";
const app = express();

//getting api routes
import authRoutes from "./modules/auth/auth.routes.js";
import mallRoutes from "./modules/malls/mall.routes.js";
import shopRoutes from "./modules/shops/shop.routes.js";
import tenantRoutes from "./modules/tenants/tenant.routes.js";
import leaseRoutes from "./modules/leases/lease.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import maintenanceRoutes from "./modules/maintenance/maintenance.routes.js";
import staffRoutes from "./modules/staff/staff.routes.js";
import announcementRoutes from "./modules/announcements/announcement.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import expenseRoutes from "./modules/expenses/expense.routes.js";
import auditLogRoutes from "./modules/auditLogs/auditLog.routes.js";

//getting token verification
import { verifyToken } from "./middlewares/authMiddleware.js";
import { requireApprovedMall } from "./middlewares/mallApprovalMiddleware.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middlewares/errorMiddleware.js";

// Security headers
app.use(helmet());
const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl, Postman) which send no Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again later." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/register-mall", authLimiter);

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.get("/health", (req, res) =>
  res.status(200).json({ success: true, status: "ok" }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/malls", verifyToken, requireApprovedMall, mallRoutes);
app.use("/api/shops", verifyToken, requireApprovedMall, shopRoutes);
app.use("/api/tenants", verifyToken, requireApprovedMall, tenantRoutes);
app.use("/api/leases", verifyToken, requireApprovedMall, leaseRoutes);
app.use("/api/expenses", verifyToken, requireApprovedMall, expenseRoutes);
app.use("/api/payments", verifyToken, requireApprovedMall, paymentRoutes);
app.use("/api/maintenances", verifyToken, requireApprovedMall, maintenanceRoutes);
app.use("/api/staffs", verifyToken, requireApprovedMall, staffRoutes);
app.use("/api/announcements", verifyToken, requireApprovedMall, announcementRoutes);
app.use("/api/reports", verifyToken, requireApprovedMall, reportRoutes);
app.use("/api/audit-logs", verifyToken, requireApprovedMall, auditLogRoutes);

// Error handling â€” previously declared in a comment but never actually
// wired in; notFoundHandler/errorHandler were dead, empty CommonJS stubs.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;


