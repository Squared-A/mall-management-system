import staffService from "./staff.service.js";

const addStaff = async (req, res) => {
  try {
    const result = await staffService.addStaff(req.body, req.user);
    res.status(201).json({
      success: true,
      data: result,
      message: "Staff and user account created successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await staffService.updateStaff({
      id,
      data: req.body,
      requestingUser: req.user,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getStaffs = async (req, res) => {
  try {
    const mallId = req.query.mallId || req.user.mallId;
    const { role, mallIds } = req.user;
    const result = await staffService.getStaffs({
      mallId,
      userRole: role,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getStaff = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await staffService.getStaff(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await staffService.deleteStaff(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

export default { addStaff, updateStaff, getStaffs, getStaff, deleteStaff };
