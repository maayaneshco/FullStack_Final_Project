const Project = require("../models/Project");

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
      $or: [
        { owner: req.user._id },
        { members: req.user._id },
      ],
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

module.exports = {
  createProject,
  getProjects,
  getProjectById,
};