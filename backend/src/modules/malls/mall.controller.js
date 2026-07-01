import mallService from "./mall.service.js";

const registerMall = async (req, res) => {
  try {
    const result = await mallService.registerMall(req.body, req.user);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateMall = async (req, res) => {
  try {
    const id = req.params.id;
    const { role, mallIds: userMallIds } = req.user;
    const result = await mallService.updateMall({
      id,
      data: req.body,
      userRole: role,
      userMallIds,
      requestingUser: req.user,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMalls = async (req, res) => {
  try {
    const { role, mallId, mallIds } = req.user;
    const result = await mallService.getMalls({
      userRole: role,
      userMallId: mallId,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMall = async (req, res) => {
  try {
    const id = req.params.id;
    const { role, mallId, mallIds } = req.user;
    const result = await mallService.getMall(id, {
      userRole: role,
      userMallId: mallId,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deleteMall = async (req, res) => {
  try {
    const id = req.params.id;
    const { role, mallIds } = req.user;
    const result = await mallService.deleteMall(id, {
      userRole: role,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export default { registerMall, updateMall, getMalls, getMall, deleteMall };
