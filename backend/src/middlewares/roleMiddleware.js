const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authenticated user found.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of: ${allowedRoles.join(", ")}.`,
      });
    }

    next();
  };
};

const requireMallScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No authenticated user found.",
    });
  }

  const { role, mallId, mallIds } = req.user;

  if (role === "SUPER_ADMIN") {
    return next();
  }

  if (role === "MALL_OWNER") {
    if (!mallIds || mallIds.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not own any malls yet.",
      });
    }
    return next();
  }

  // MALL_MANAGER, ACCOUNTANT, TENANT, staff-derived roles
  if (!mallId) {
    return res.status(403).json({
      success: false,
      message: "Access denied. No mall assigned to this account.",
    });
  }

  next();
};

export { requireRole, requireMallScope };
