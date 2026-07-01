const resolveRequestedMallId = (req) => {
  return (
    req.params?.mallId ||
    req.query?.mallId ||
    req.body?.mallId ||
    req.user?.mallId ||
    null
  );
};

const attachMallContext = (req, res, next) => {
  const { role, mallId: userMallId, mallIds: userMallIds } = req.user || {};
  const requestedMallId = resolveRequestedMallId(req);

  if (role === "SUPER_ADMIN") {
    // Platform admin may target a specific mall or none (global view).
    req.activeMallId = requestedMallId || null;
    return next();
  }

  if (role === "MALL_OWNER") {
    const owned = (userMallIds || []).map((id) => id.toString());

    if (owned.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not own any malls yet.",
      });
    }

    if (!requestedMallId) {
      return res.status(400).json({
        success: false,
        message:
          "A mallId must be provided to identify which of your malls this request applies to.",
      });
    }

    if (!owned.includes(requestedMallId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not own this mall.",
      });
    }

    req.activeMallId = requestedMallId.toString();
    return next();
  }

  if (!userMallId) {
    return res.status(403).json({
      success: false,
      message: "Access denied. No mall assigned to this account.",
    });
  }

  if (requestedMallId && requestedMallId.toString() !== userMallId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You cannot act outside your assigned mall.",
    });
  }

  req.activeMallId = userMallId.toString();
  next();
};

export { attachMallContext };
