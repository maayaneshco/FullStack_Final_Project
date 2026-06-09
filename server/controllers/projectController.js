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

module.exports = {
  createProject,
};