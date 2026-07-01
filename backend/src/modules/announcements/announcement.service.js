import mongoose from "mongoose";
import Announcement from "./announcement.model.js";
import Mall from "../malls/mall.model.js";

// Previously: `Announcement.create(data)` — no validation, no authorization.
const addAnnouncement = async (data, requestingUser) => {
  const { mallId, title, message } = data;

  if (!mallId || !title || !message) {
    throw new Error("mallId, title, and message are required");
  }

  const mall = await Mall.findOne({ _id: mallId, isDeleted: false });
  if (!mall) {
    throw new Error("Mall not found");
  }

  await assertMallAccess(mallId, requestingUser);

  const newAnnouncement = await Announcement.create({
    mallId,
    title,
    message,
    targetRole: data.targetRole || "all",
    createdBy: requestingUser?.id,
  });
  return newAnnouncement;
};

const updateAnnouncement = async ({ id, data, requestingUser }) => {
  const announcement = await Announcement.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!announcement) throw new Error("Announcement not found");

  await assertMallAccess(announcement.mallId, requestingUser);

  const { mallId, createdBy, ...safeData } = data;
  const updated = await Announcement.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true,
  });
  return updated;
};

// Previously: `.populate("shop")` referenced a field that does not exist
// anywhere on the Announcement schema (Announcement already has a direct
// mallId field — there was never a "shop" relation to populate), so the
// populate silently no-op'd and `m.shop?.mallId === mallId` always
// evaluated to `undefined === mallId`, i.e. always false — meaning
// getAnnouncements returned an EMPTY array for every single caller,
// regardless of role or mall. The endpoint was completely non-functional.
//
// This version also adds targetRole filtering, which never existed before
// despite the schema having a targetRole field — every announcement was
// visible to every role that could see the (broken, empty) list.
const getAnnouncements = async ({ mallId, userRole, userMallId, userMallIds }) => {
  let filter = { isDeleted: false };

  if (userRole === "SUPER_ADMIN") {
    if (mallId) filter.mallId = new mongoose.Types.ObjectId(mallId);
  } else if (userRole === "MALL_OWNER") {
    const owned = userMallIds || [];
    if (mallId) {
      if (!owned.map((m) => m.toString()).includes(mallId.toString())) {
        throw new Error("You do not own this mall");
      }
      filter.mallId = new mongoose.Types.ObjectId(mallId);
    } else {
      filter.mallId = { $in: owned };
    }
  } else {
    if (!userMallId) return [];
    filter.mallId = new mongoose.Types.ObjectId(userMallId);
  }

  // Non-management roles only see announcements targeted at them or "all".
  if (userRole === "TENANT" || userRole === "ACCOUNTANT") {
    filter.targetRole = { $in: ["all", userRole] };
  }

  const announcements = await Announcement.find(filter)
    .populate("createdBy", "fullName")
    .sort({ createdAt: -1 });
  return announcements;
};

const getAnnouncement = async (id, requestingUser) => {
  const announcement = await Announcement.findOne({
    _id: id,
    isDeleted: false,
  }).populate("createdBy", "fullName");
  if (!announcement) throw new Error("Announcement not found");

  if (
    (requestingUser?.role === "TENANT" || requestingUser?.role === "ACCOUNTANT") &&
    announcement.targetRole !== "all" &&
    announcement.targetRole !== requestingUser.role
  ) {
    throw new Error("Access denied.");
  }

  await assertMallAccess(announcement.mallId, requestingUser);
  return announcement;
};

const deleteAnnouncement = async (id, requestingUser) => {
  const announcement = await Announcement.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!announcement) throw new Error("Announcement not found");

  await assertMallAccess(announcement.mallId, requestingUser);

  await Announcement.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

async function assertMallAccess(announcementMallId, requestingUser) {
  if (!requestingUser) return;
  const { role, mallId, mallIds } = requestingUser;

  if (role === "SUPER_ADMIN") return;

  if (role === "MALL_OWNER") {
    const owned = (mallIds || []).map((m) => m.toString());
    if (!owned.includes(announcementMallId.toString())) {
      throw new Error("Access denied. You do not own this mall.");
    }
    return;
  }

  // Only management-tier roles may write announcements. TENANT and
  // ACCOUNTANT may only ever read them (enforced at the route level via
  // requireRole), but this guard double-checks at the service layer too
  // since assertMallAccess is shared by create/update/delete.
  if (role !== "MALL_MANAGER") {
    throw new Error("Access denied. You are not authorized to manage announcements.");
  }

  if (!mallId || mallId.toString() !== announcementMallId.toString()) {
    throw new Error(
      "Access denied. This announcement is outside your assigned mall."
    );
  }
}

export default {
  addAnnouncement,
  updateAnnouncement,
  getAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
};
