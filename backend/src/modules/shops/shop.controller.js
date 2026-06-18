import shopService from "./shop.service.js";

const registerShop = async (req, res) => {
  try {
    const result = await shopService.registerShop(req.body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    // console.log(error);
    // console.log(error.response);
    res.status(401).json({ error: error.message });
  }
};

const updateShop = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const result = await shopService.updateShop({ id, data: req.body });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getShops = async (req, res) => {
  try {
    const mallId = req.user.mallId;
    const result = await shopService.getShops(mallId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getShop = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await shopService.getShop(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const deleteShop = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await shopService.deleteShop(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default { registerShop, updateShop, getShops, getShop, deleteShop };
