const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.get("/refresh",authController.refresh);
router.get("/logout", authController.logout);

module.exports = router;