import joi from "joi";

const validateLogin = (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    mallId: joi.string(),
    remember: joi.boolean(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  next();
};

const validateRegister = (req, res, next) => {
  const schema = joi.object({
    fullName: joi.string().min(2).required(),
    email: joi.string().email().required(),
    phone: joi.string().required(),
    password: joi.string().min(8).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  next();
};

const validateRegisterMall = (req, res, next) => {
  const schema = joi.object({
    mallName: joi.string().min(2).required(),
    ownerName: joi.string().min(2).required(),
    email: joi.string().email().required(),
    phone: joi.string().required(),
    password: joi.string().min(8).required(),
    confirmPassword: joi.string().valid(joi.ref("password")).messages({
      "any.only": "Passwords do not match",
    }),
    address: joi.string().allow("").optional(),
    city: joi.string().allow("").optional(),
    floors: joi.number().min(1).optional(),
    totalShops: joi.number().min(0).optional(),
    description: joi.string().allow("").optional(),
    logo: joi.string().allow("").optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  next();
};

export default { validateLogin, validateRegister, validateRegisterMall };
