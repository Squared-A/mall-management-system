import announcementService from "./announcement.service.js";

const addAnnouncement = async (req, res) => {
  try {
    const mallId = req.body.mallId || req.user.mallId;
    const result = await announcementService.addAnnouncement(
      { ...req.body, mallId },
      req.user
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await announcementService.updateAnnouncement({
      id,
      data: req.body,
      requestingUser: req.user,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    // Previously: `announcementService.getAnnouncements(mallId)` was
    // called with just a bare mallId, but the (broken) service ignored it
    // entirely anyway since the populate("shop") bug made every result set
    // empty regardless of input.
    const mallId = req.query.mallId || req.user.mallId;
    const { role, mallId: userMallId, mallIds } = req.user;
    const result = await announcementService.getAnnouncements({
      mallId,
      userRole: role,
      userMallId,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAnnouncement = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await announcementService.getAnnouncement(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await announcementService.deleteAnnouncement(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

export default {
  addAnnouncement,
  updateAnnouncement,
  getAnnouncements,
  getAnnouncement,
  deleteAnnouncement,
};
