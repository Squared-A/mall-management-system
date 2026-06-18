import mallService from "./mall.service.js";

const registerMall = async (req, res) => {
  try {
    const result = await mallService.registerMall(req.body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    // console.log(error);
    // console.log(error.response);
    res.status(401).json({ error: error.message });
  }
};

const updateMall = async (req, res) => {
  try {
    const id = req.params.id || req.user.mallId;
    console.log(id);
    const result = await mallService.updateMall({ id, data: req.body });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getMalls = async (req, res) => {
  try {
    const result = await mallService.getMalls();
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getMall = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await mallService.getMall(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const deleteMall = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await mallService.deleteMall(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default { registerMall, updateMall, getMalls, getMall, deleteMall };
