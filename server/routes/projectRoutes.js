const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
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

router.get(
  "/:id",
  protect,
  authorize("admin", "researcher"),
  getProjectById
);

router.put(
  "/:id",
  protect,
  authorize("admin", "researcher"),
  updateProject
);

module.exports = router;