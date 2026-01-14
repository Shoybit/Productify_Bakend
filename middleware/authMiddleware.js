module.exports = function (req, res, next) {
  const isAuth = req.cookies.auth;

  if (!isAuth) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  next();
};
