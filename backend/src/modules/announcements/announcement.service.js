import Announcement from "./announcement.model.js";

const addAnnouncement = async (data) => {
  const newAnnouncement = await Announcement.create(data);
  return newAnnouncement;
};

const updateAnnouncement = async ({ id, data }) => {
  console.log(id, data);
  const updated = await Announcement.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

const getAnnouncements = async (mallId) => {
  const announcements = await Announcement.find({ isDeleted: false }).populate(
    "shop",
  );
  const filteredAnnouncements = announcements.filter(
    (m) => m.shop?.mallId === mallId,
  );
  return filteredAnnouncements;
};

const getAnnouncement = async (id) => {
  const announcement = await Announcement.findById(id);
  return announcement;
};

const deleteAnnouncement = async (id) => {
  await Announcement.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

export default {
  addAnnouncement,
  updateAnnouncement,
  getAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
};
