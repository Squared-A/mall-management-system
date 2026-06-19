// Express app setup
import express from "express";
import cors from "cors";
const app = express();

//getting api routes
import authRoutes from "./modules/auth/auth.routes.js";
import mallRoutes from "./modules/malls/mall.routes.js";
import shopRoutes from "./modules/shops/shop.routes.js";
import tenantRoutes from "./modules/tenants/tenant.routes.js";
import leaseRoutes from "./modules/leases/lease.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import MaintenaceRoutes from "./modules/maintenance/maintenance.routes.js";
import staffRoutes from "./modules/staff/staff.routes.js";
import announcementRoutes from "./modules/announcements/announcement.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import expenseRoutes from "./modules/expenses/expense.routes.js";

//getting token vdrification
import { verifyToken } from "./middlewares/authMiddleware.js";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/malls", verifyToken, mallRoutes);
app.use("/api/shops", verifyToken, shopRoutes);
app.use("/api/tenants", verifyToken, tenantRoutes);
app.use("/api/leases", verifyToken, leaseRoutes);
app.use("/api/expenses", verifyToken, expenseRoutes);
app.use("/api/payments", verifyToken, paymentRoutes);
app.use("/api/maintenances", verifyToken, MaintenaceRoutes);
app.use("/api/staffs", verifyToken, staffRoutes);
app.use("/api/announcements", verifyToken, announcementRoutes);
app.use("/api/reports", verifyToken, reportRoutes);

// Error handling

export default app;
