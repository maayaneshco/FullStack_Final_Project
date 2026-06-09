const express = require("express");

const { createProject } = require("../controllers/projectController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin", "researcher"),
  createProject
);

module.exports = router;