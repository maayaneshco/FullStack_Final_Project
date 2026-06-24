const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

// Create a new task
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

        // Task type must be either "project" or "lab"
        if (!["project", "lab"].includes(taskType)) {
            return res.status(400).json({
                message: "Invalid task type",
            });
        }

        // Additional validation for project-related tasks
        if (taskType === "project") {

            // Project tasks must be linked to a project
            if (!project) {
                return res.status(400).json({
                    message: "Project is required for project tasks",
                });
            }

            // Verify that the target project exists
            const existingProject = await Project.findById(project);

            if (!existingProject) {
                return res.status(404).json({
                    message: "Project not found",
                });
            }

            const isAdmin = req.user.role === "admin";

            const isOwner =
                existingProject.owner.toString() === req.user._id.toString();

            // Only project owner or admin can create project tasks
            if (!isAdmin && !isOwner) {
                return res.status(403).json({
                    message: "Not authorized to create tasks for this project",
                });
            }

            // Make sure all assigned users belong to the project
            if (assignedTo.length > 0) {
                const projectMemberIds = existingProject.members.map(
                    (member) => member.toString()
                );

                const allAssignedAreMembers = assignedTo.every(
                    (userId) =>
                        projectMemberIds.includes(userId.toString())
                );

                if (!allAssignedAreMembers) {
                    return res.status(400).json({
                        message: "Assigned users must be project members",
                    });
                }
            }
        }

        // Additional validation for lab tasks
        if (taskType === "lab") {

            // Lab tasks are general lab duties and cannot belong to a project
            if (project) {
                return res.status(400).json({
                    message: "Lab tasks cannot be linked to a project",
                });
            }

            const isAdmin = req.user.role === "admin";
            const isResearcher = req.user.role === "researcher";

            // Only authenticated lab members can create lab tasks
            if (!isAdmin && !isResearcher) {
                return res.status(403).json({
                    message: "Not authorized to create lab tasks",
                });
            }
        }

        // Verify that all assigned users exist in the system
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

        // Create and save the new task
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

            // Store the user who created the task
            createdBy: req.user._id,
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get all lab tasks
const getLabTasks = async (req, res) => {
    try {
        // Retrieve only tasks that belong to the lab task category
        const tasks = await Task.find({
            taskType: "lab",
        })

            // Replace assigned user IDs with user details
            .populate(
                "assignedTo",
                "firstName lastName email"
            )

            // Include basic information about the user who created the task
            .populate(
                "createdBy",
                "firstName lastName email"
            )

            // Show newest tasks first
            .sort({
                createdAt: -1,
            });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get all project tasks relevant to the current user
const getMyProjectTasks = async (req, res) => {
    try {

        // Get all projects owned by the current user
        const ownedProjects = await Project.find({
            owner: req.user._id,
        }).select("_id");

        const ownedProjectIds = ownedProjects.map(
            (project) => project._id
        );

        // Get all tasks that belong to projects owned by the current user
        const ownerTasks = await Task.find({
            taskType: "project",
            project: {
                $in: ownedProjectIds,
            },
        });

        // Get all project tasks directly assigned to the current user
        const assignedTasks = await Task.find({
            taskType: "project",
            assignedTo: req.user._id,
        });

        // Use a Map to remove duplicate tasks when a user is both project owner and assignee
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


// Get a specific task by its ID
const getTaskById = async (req, res) => {
    try {

        // Load the task together with related user and project information
        const task = await Task.findById(req.params.id)
            .populate("assignedTo", "firstName lastName email")
            .populate("createdBy", "firstName lastName email")
            .populate("project", "title owner members");

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const isAdmin = req.user.role === "admin";

        // Lab tasks are visible to any authenticated user
        if (task.taskType === "lab") {
            return res.status(200).json(task);
        }

        const project = task.project;

        const isOwner =
            project.owner.toString() === req.user._id.toString();

        const isMember = project.members.some(
            (member) => member.toString() === req.user._id.toString()
        );

        const isAssigned = task.assignedTo.some(
            (user) => user._id.toString() === req.user._id.toString()
        );

        // Only admins, project owners, project members, or assigned users are allowed to view project tasks
        if (!isAdmin && !isOwner && !isMember && !isAssigned) {
            return res.status(403).json({
                message: "Not authorized to view this task",
            });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Update an existing task
const updateTask = async (req, res) => {
    try {

        // Load the task together with its related project
        const task = await Task.findById(req.params.id)
            .populate("project");

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const isAdmin = req.user.role === "admin";

        // Additional permission checks for project tasks
        if (task.taskType === "project") {

            const isOwner =
                task.project.owner.toString() ===
                req.user._id.toString();

            // Only project owner or admin can update project tasks
            if (!isAdmin && !isOwner) {
                return res.status(403).json({
                    message: "Not authorized to update this task",
                });
            }

            // If assigned users are being updated, verify they belong to the project
            if (req.body.assignedTo) {

                const projectMemberIds =
                    task.project.members.map((member) =>
                        member.toString()
                    );

                const allAssignedAreMembers =
                    req.body.assignedTo.every((userId) =>
                        projectMemberIds.includes(
                            userId.toString()
                        )
                    );

                if (!allAssignedAreMembers) {
                    return res.status(400).json({
                        message:
                            "Assigned users must be project members",
                    });
                }
            }
        }

        // Update only fields that were provided in the request body
        task.title =
            req.body.title ?? task.title;

        task.description =
            req.body.description ?? task.description;

        task.taskCategory =
            req.body.taskCategory ??
            task.taskCategory;

        task.priority =
            req.body.priority ?? task.priority;

        task.assignedTo =
            req.body.assignedTo ??
            task.assignedTo;

        task.dueDate =
            req.body.dueDate ?? task.dueDate;

        task.recurrence =
            req.body.recurrence ??
            task.recurrence;

        const updatedTask = await task.save();

        res.status(200).json(updatedTask);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Update task status
const updateTaskStatus = async (req, res) => {
    try {

        const { status } = req.body;

        // Allow only predefined workflow statuses
        const allowedStatuses = [
            "todo",
            "in_progress",
            "completed",
            "cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        // Load the task together with its related project
        const task = await Task.findById(req.params.id)
            .populate("project");

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const isAdmin = req.user.role === "admin";

        let isOwner = false;

        // Project tasks may be managed by the project owner
        if (task.project) {
            isOwner =
                task.project.owner.toString() ===
                req.user._id.toString();
        }

        // Assigned users are allowed to update only the task status
        const isAssigned = task.assignedTo.some(
            (userId) =>
                userId.toString() ===
                req.user._id.toString()
        );

        // Only admins, project owners, or assigned users can change status
        if (!isAdmin && !isOwner && !isAssigned) {
            return res.status(403).json({
                message:
                    "Not authorized to update task status",
            });
        }

        task.status = status;

        await task.save();

        res.status(200).json(task);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    try {

        // Load the task together with its related project
        const task = await Task.findById(req.params.id)
            .populate("project");

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const isAdmin = req.user.role === "admin";

        let isOwner = false;

        // Project tasks may be deleted by the project owner
        if (task.project) {
            isOwner =
                task.project.owner.toString() ===
                req.user._id.toString();
        }

        // Only admins and project owners can delete tasks
        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                message: "Not authorized to delete this task",
            });
        }

        // Permanently remove the task from the database
        await task.deleteOne();

        res.status(200).json({
            message: "Task deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get all lab tasks assigned to the current user
const getMyLabTasks = async (req, res) => {
    try {

        // Retrieve only lab tasks assigned to the logged-in user
        const tasks = await Task.find({
            taskType: "lab",
            assignedTo: req.user._id,
        })

            // Replace assigned user IDs with user details
            .populate("assignedTo", "firstName lastName email")

            // Include information about the user who created the task
            .populate("createdBy", "firstName lastName email")

            // Show upcoming tasks first, then newest tasks
            .sort({ dueDate: 1, createdAt: -1 });

        res.status(200).json(tasks);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get all overdue tasks relevant to the current user
const getOverdueTasks = async (req, res) => {
    try {

        // Current date is used to identify overdue tasks
        const today = new Date();

        const isAdmin = req.user.role === "admin";

        // Admins can view all overdue tasks in the system
        if (isAdmin) {

            const tasks = await Task.find({
                dueDate: { $lt: today },

                // Exclude tasks that are already finished or cancelled
                status: {
                    $nin: ["completed", "cancelled"],
                },
            })
                .populate("assignedTo", "firstName lastName email")
                .populate("createdBy", "firstName lastName email")
                .populate("project", "title")

                // Show the oldest overdue tasks first
                .sort({ dueDate: 1 });

            return res.status(200).json(tasks);
        }

        // Get all projects owned by the current user
        const ownedProjects = await Project.find({
            owner: req.user._id,
        }).select("_id");

        const ownedProjectIds = ownedProjects.map(
            (project) => project._id
        );

        // Return overdue tasks that are either:
        // 1. Assigned directly to the user
        // 2. Part of a project owned by the user
        const tasks = await Task.find({
            dueDate: { $lt: today },

            status: {
                $nin: ["completed", "cancelled"],
            },

            $or: [
                {
                    assignedTo: req.user._id,
                },
                {
                    project: {
                        $in: ownedProjectIds,
                    },
                },
            ],
        })
            .populate("assignedTo", "firstName lastName email")
            .populate("createdBy", "firstName lastName email")
            .populate("project", "title")

            // Show the most urgent overdue tasks first
            .sort({ dueDate: 1 });

        res.status(200).json(tasks);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get all completed tasks relevant to the current user
const getCompletedTasks = async (req, res) => {
    try {
        const isAdmin = req.user.role === "admin";

        // Admins can view all completed tasks in the system
        if (isAdmin) {
            const tasks = await Task.find({
                status: "completed",
            })
                .populate("assignedTo", "firstName lastName email")
                .populate("createdBy", "firstName lastName email")
                .populate("project", "title")

                // Show the most recently completed or updated tasks first
                .sort({ updatedAt: -1 });

            return res.status(200).json(tasks);
        }

        // Get all projects owned by the current user
        const ownedProjects = await Project.find({
            owner: req.user._id,
        }).select("_id");

        const ownedProjectIds = ownedProjects.map(
            (project) => project._id
        );

        // Return completed tasks that are either:
        // 1. Assigned directly to the user
        // 2. Part of a project owned by the user
        const tasks = await Task.find({
            status: "completed",
            $or: [
                {
                    assignedTo: req.user._id,
                },
                {
                    project: {
                        $in: ownedProjectIds,
                    },
                },
            ],
        })
            .populate("assignedTo", "firstName lastName email")
            .populate("createdBy", "firstName lastName email")
            .populate("project", "title")

            // Show the most recently completed or updated tasks first
            .sort({ updatedAt: -1 });

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
    getTaskById,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getMyLabTasks,
    getOverdueTasks,
    getCompletedTasks,
};