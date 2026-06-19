import shopService from "./shop.service.js";

const registerShop = async (req, res) => {
  try {
    const result = await shopService.registerShop(req.body, req.user);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateShop = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await shopService.updateShop({
      id,
      data: req.body,
      requestingUser: req.user,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getShops = async (req, res) => {
  try {
    // mallId may come from the query string (e.g. owner browsing one of
    // their malls) or fall back to the user's own assigned mall.
    const mallId = req.query.mallId || req.user.mallId;
    const { role, mallIds } = req.user;
    const result = await shopService.getShops({
      mallId,
      userRole: role,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getShop = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await shopService.getShop(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deleteShop = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await shopService.deleteShop(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

export default { registerShop, updateShop, getShops, getShop, deleteShop };
