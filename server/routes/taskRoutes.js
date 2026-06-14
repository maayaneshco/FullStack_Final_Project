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
    deleteTask,
    getMyLabTasks,
    getOverdueTasks,
} = require("../controllers/taskController");

router.post("/", protect, createTask);

router.get("/lab", protect, getLabTasks);

router.get("/my-project-tasks", protect, getMyProjectTasks);

router.get("/my-lab-tasks", protect, getMyLabTasks);

router.get("/overdue", protect, getOverdueTasks);

router.get("/:id", protect, getTaskById);

router.put("/:id", protect, updateTask);

router.put("/:id/status", protect, updateTaskStatus);

router.delete("/:id", protect, deleteTask);

module.exports = router;