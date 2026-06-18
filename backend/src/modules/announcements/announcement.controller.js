import announcementService from "./announcement.service.js";

const addAnnouncement = async (req, res) => {
  try {
    const result = await announcementService.addAnnouncement(req.body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    // console.log(error);
    // console.log(error.response);
    res.status(401).json({ error: error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const result = await announcementService.updateAnnouncement({
      id,
      data: req.body,
    });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const mallId = req.user.mallId;
    const result = await announcementService.getAnnouncements(mallId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getAnnouncement = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await announcementService.getAnnouncement(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await announcementService.deleteAnnouncement(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default {
  addAnnouncement,
  updateAnnouncement,
  getAnnouncements,
  getAnnouncement,
  deleteAnnouncement,
};
