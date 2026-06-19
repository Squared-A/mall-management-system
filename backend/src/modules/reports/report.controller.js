import reportsService from "./reports.service.js";

// Previously every handler below only forwarded `mallId: req.user.mallId`,
// which is undefined for MALL_OWNER (owners use mallIds[]) — every report
// screen for the system's primary persona silently returned zeroed-out
// stats. Now also accepts an explicit ?mallId= query param (validated
// against ownership in the service) so owners can pick which of their
// malls to view, and forwards mallIds/tenantId for proper scoping.

const dashboardStats = async (req, res) => {
  try {
    const { role, mallId: userMallId, mallIds, id } = req.user;
    const data = await reportsService.dashboardStats({
      userId: id,
      mallId: req.query.mallId,
      userRole: role,
      userMallId,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const platformReport = async (req, res) => {
  try {
    const { role, id } = req.user;
    if (role !== "SUPER_ADMIN") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }
    const data = await reportsService.platformReport({
      userId: id,
      userRole: role,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const revenueChart = async (req, res) => {
  try {
    const { role, mallId: userMallId, mallIds, id } = req.user;
    const data = await reportsService.revenueChart({
      userId: id,
      mallId: req.query.mallId,
      userRole: role,
      userMallId,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const recentActivities = async (req, res) => {
  try {
    const { role, mallId: userMallId, mallIds, id } = req.user;
    const data = await reportsService.recentActivities({
      userId: id,
      mallId: req.query.mallId,
      userRole: role,
      userMallId,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const occupancyReport = async (req, res) => {
  try {
    const { role, mallId: userMallId, mallIds, id } = req.user;
    const data = await reportsService.occupancyReport({
      userId: id,
      mallId: req.query.mallId,
      userRole: role,
      userMallId,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const expenseReport = async (req, res) => {
  try {
    const { role, mallId: userMallId, mallIds, id } = req.user;
    const data = await reportsService.expenseReport({
      userId: id,
      mallId: req.query.mallId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      userRole: role,
      userMallId,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const exportReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { role, mallId: userMallId, mallIds, id } = req.user;
    const buffer = await reportsService.exportReport(type, {
      userId: id,
      mallId: req.query.mallId,
      userRole: role,
      userMallId,
      userMallIds: mallIds,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="report-${type}.pdf"`);
    res.send(buffer);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export default {
  dashboardStats,
  platformReport,
  revenueChart,
  recentActivities,
  occupancyReport,
  expenseReport,
  exportReport,
};
