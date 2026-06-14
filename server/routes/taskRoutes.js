const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    createTask,
    getLabTasks,
    getMyProjectTasks,
    getTaskById,
    updateTask,
    updateTaskStatus,
} = require("../controllers/taskController");

router.post("/", protect, createTask);

router.get("/lab", protect, getLabTasks);

router.get("/my-project-tasks", protect, getMyProjectTasks);

router.put("/:id", protect, updateTask);

router.put("/:id/status", protect, updateTaskStatus);

router.get("/:id", protect, getTaskById);

module.exports = router;