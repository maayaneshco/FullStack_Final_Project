const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createTask,
  getLabTasks,
  getMyProjectTasks,
} = require("../controllers/taskController");

router.post("/", protect, createTask);

router.get("/lab", protect, getLabTasks);

router.get("/my-project-tasks", protect, getMyProjectTasks);

module.exports = router;