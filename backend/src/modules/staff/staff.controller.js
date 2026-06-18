import staffService from "./staff.service.js";

const addStaff = async (req, res) => {
  try {
    const result = await staffService.addStaff(req.body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    // console.log(error);
    // console.log(error.response);
    res.status(401).json({ error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const result = await staffService.updateStaff({
      id,
      data: req.body,
    });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getStaffs = async (req, res) => {
  try {
    const mallId = req.user.mallId;
    const result = await staffService.getStaffs(mallId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getStaff = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await staffService.getStaff(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await staffService.deleteStaff(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default {
  addStaff,
  updateStaff,
  getStaffs,
  getStaff,
  deleteStaff,
};
