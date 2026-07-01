import auditLogService from "./auditLog.service.js";

const getLogs = async (req, res) => {
  try {
    const { role, mallIds } = req.user;
    const result = await auditLogService.getLogs({
      mallId: req.query.mallId,
      userRole: role,
      userMallIds: mallIds,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export default { getLogs };
