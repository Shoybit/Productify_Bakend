const express = require("express");
const router = express.Router();
const users = require("../data/users.json");

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials"
    });
  }

  res.cookie("auth", "true", {
    httpOnly: false,
    sameSite: "lax"
  });

  res.json({
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth");
  res.json({ message: "Logged out" });
});

module.exports = router;
