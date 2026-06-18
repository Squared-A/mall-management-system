import authService from "./auth.service.js";

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    console.log(error.response);
    res.status(401).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default { login, register };
