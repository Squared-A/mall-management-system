import reportsService from "./reports.service.js";

const dashboardStats = async (req, res) => {
  try {
    const { role, mallId, id } = req.user;
    const data = await reportsService.dashboardStats({
      userId: id,
      mallId,
      userRole: role,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const revenueChart = async (req, res) => {
  try {
    const { role, mallId, id } = req.user;
    const data = await reportsService.revenueChart({
      userId: id,
      mallId,
      userRole: role,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default { dashboardStats, revenueChart };
