const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      taskType,
      taskCategory,
      priority,
      assignedTo = [],
      project,
      dueDate,
      recurrence,
    } = req.body;

    if (!["project", "lab"].includes(taskType)) {
      return res.status(400).json({
        message: "Invalid task type",
      });
    }

    if (taskType === "project") {
      if (!project) {
        return res.status(400).json({
          message: "Project is required for project tasks",
        });
      }

      const existingProject = await Project.findById(project);

      if (!existingProject) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const isAdmin = req.user.role === "admin";

      const isOwner =
        existingProject.owner.toString() === req.user._id.toString();

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          message: "Not authorized to create tasks for this project",
        });
      }

      if (assignedTo.length > 0) {
        const projectMemberIds = existingProject.members.map((member) =>
          member.toString()
        );

        const allAssignedAreMembers = assignedTo.every((userId) =>
          projectMemberIds.includes(userId.toString())
        );

        if (!allAssignedAreMembers) {
          return res.status(400).json({
            message: "Assigned users must be project members",
          });
        }
      }
    }

    if (taskType === "lab") {
      if (project) {
        return res.status(400).json({
          message: "Lab tasks cannot be linked to a project",
        });
      }

      const isAdmin = req.user.role === "admin";
      const isResearcher = req.user.role === "researcher";

      if (!isAdmin && !isResearcher) {
        return res.status(403).json({
          message: "Not authorized to create lab tasks",
        });
      }
    }

    if (assignedTo.length > 0) {
      const users = await User.find({
        _id: { $in: assignedTo },
      });

      if (users.length !== assignedTo.length) {
        return res.status(400).json({
          message: "One or more assigned users do not exist",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      taskType,
      taskCategory,
      priority,
      assignedTo,
      project: taskType === "lab" ? null : project,
      dueDate,
      recurrence,
      createdBy: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getLabTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      taskType: "lab",
    })
      .populate("assignedTo", "firstName lastName email")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyProjectTasks = async (req, res) => {
  try {
    const ownedProjects = await Project.find({
      owner: req.user._id,
    }).select("_id");

    const ownedProjectIds = ownedProjects.map(
      (project) => project._id
    );

    const ownerTasks = await Task.find({
      taskType: "project",
      project: {
        $in: ownedProjectIds,
      },
    });

    const assignedTasks = await Task.find({
      taskType: "project",
      assignedTo: req.user._id,
    });

    const taskMap = new Map();

    [...ownerTasks, ...assignedTasks].forEach((task) => {
      taskMap.set(task._id.toString(), task);
    });

    const tasks = Array.from(taskMap.values());

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getLabTasks,
  getMyProjectTasks,
};