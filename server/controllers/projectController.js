const Project = require("../models/Project");
const User = require("../models/User");

// Create new project
const createProject = async (req, res) => {
  try {
    const { title, description, priority, startDate, endDate } = req.body;

    const project = await Project.create({
      title,
      description,
      priority,
      startDate,
      endDate,
      owner: req.user._id,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create project",
    });
  }
};

// Get all projects for current user
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get projects",
    });
  }
};

// Get single project
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isOwner =
      project.owner.toString() === req.user._id.toString();

    const isMember = project.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get project",
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isOwner =
      project.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const {
      title,
      description,
      status,
      priority,
      startDate,
      endDate,
      notes,
    } = req.body;

    project.title = title || project.title;
    project.description = description || project.description;
    project.status = status || project.status;
    project.priority = priority || project.priority;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.notes = notes || project.notes;

    const updatedProject = await project.save();

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update project",
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isOwner =
      project.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete project",
    });
  }
};

// Add member to project
const addMemberToProject = async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isOwner =
      project.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyMember = project.members.some(
      (member) => member.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "User is already a member",
      });
    }

    project.members.push(userId);

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({
      message: "Failed to add member",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
};