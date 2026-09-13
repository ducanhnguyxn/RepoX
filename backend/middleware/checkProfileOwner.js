function checkProfileOwner(req, res, next) {
  const targetId = req.params.id;
  const userId = req.user.userId;

  if (targetId !== userId.toString()) {
    return res.status(403).json({
      message: "You don't have permission to perform this action",
    });
  }

  next();
}

module.exports = { checkProfileOwner };
