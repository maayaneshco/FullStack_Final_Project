const express = require("express");

const {
  createProject,
  getProjects,
} = require("../controllers/projectController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("admin", "researcher"),
  getProjects
);

router.post(
  "/",
  protect,
  authorize("admin", "researcher"),
  createProject
);

module.exports = router;