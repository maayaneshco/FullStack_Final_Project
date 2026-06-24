const Responsibility = require("../models/Responsibility");

// Create responsibility (Admin only)
const createResponsibility = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            assignedTo,
            backupUser,
            startDate,
            endDate,
        } = req.body;

        // Check if responsibility title already exists
        const existingResponsibility = await Responsibility.findOne({
            title,
        });

        if (existingResponsibility) {
            return res.status(400).json({
                message: "Responsibility with this title already exists",
            });
        }

        // Create new responsibility
        const responsibility = await Responsibility.create({
            title,
            description,
            category,
            assignedTo,
            backupUser,
            startDate,
            endDate,

            // Save creator from JWT token
            createdBy: req.user._id,
        });

        // Return created responsibility
        res.status(201).json(responsibility);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get all active responsibilities
const getResponsibilities = async (req, res) => {
    try {
        // Get all active responsibilities
        const responsibilities = await Responsibility.find({
            isActive: true,
        })
            .populate("assignedTo", "firstName lastName email")
            .populate("backupUser", "firstName lastName email")
            .populate("createdBy", "firstName lastName email")
            .sort({ createdAt: -1 });

        // Return responsibilities list
        res.status(200).json(responsibilities);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get responsibility by ID
const getResponsibilityById = async (req, res) => {
    try {
        // Find responsibility by ID
        const responsibility = await Responsibility.findById(
            req.params.id
        )
            .populate("assignedTo", "firstName lastName email")
            .populate("backupUser", "firstName lastName email")
            .populate("createdBy", "firstName lastName email");

        // Check if responsibility exists
        if (!responsibility) {
            return res.status(404).json({
                message: "Responsibility not found",
            });
        }

        // Return responsibility
        res.status(200).json(responsibility);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Update responsibility (Admin only)
const updateResponsibility = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            assignedTo,
            backupUser,
            startDate,
            endDate,
            isActive,
        } = req.body;

        // Check if responsibility exists
        const responsibility = await Responsibility.findById(
            req.params.id
        );

        if (!responsibility) {
            return res.status(404).json({
                message: "Responsibility not found",
            });
        }

        // Check for duplicate title
        if (title && title !== responsibility.title) {
            const existingResponsibility =
                await Responsibility.findOne({
                    title,
                });

            if (existingResponsibility) {
                return res.status(400).json({
                    message:
                        "Responsibility with this title already exists",
                });
            }
        }

        // Update fields
        responsibility.title =
            title ?? responsibility.title; // Checks only null and undefined

        responsibility.description =
            description ?? responsibility.description;

        responsibility.category =
            category ?? responsibility.category;

        responsibility.assignedTo =
            assignedTo ?? responsibility.assignedTo;

        responsibility.backupUser =
            backupUser ?? responsibility.backupUser;

        responsibility.startDate =
            startDate ?? responsibility.startDate;

        responsibility.endDate =
            endDate ?? responsibility.endDate;

        responsibility.isActive =
            isActive ?? responsibility.isActive;

        // Save changes
        const updatedResponsibility =
            await responsibility.save();

        // Return updated responsibility
        res.status(200).json(updatedResponsibility);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Delete responsibility (Soft Delete - Admin only)
const deleteResponsibility = async (req, res) => {
    try {
        // Find responsibility by ID
        const responsibility = await Responsibility.findById(
            req.params.id
        );

        // Check if responsibility exists
        if (!responsibility) {
            return res.status(404).json({
                message: "Responsibility not found",
            });
        }

        // Check if responsibility is already inactive
        if (!responsibility.isActive) {
            return res.status(400).json({
                message: "Responsibility is already inactive",
            });
        }

        // Mark responsibility as inactive
        responsibility.isActive = false;

        // Save changes
        await responsibility.save();

        // Return success message
        res.status(200).json({
            message: "Responsibility deleted successfully",
        });
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get responsibilities assigned to the logged-in user
const getMyResponsibilities = async (req, res) => {
    try {
        // Get responsibilities where user is assigned or backup user
        const responsibilities = await Responsibility.find({
            isActive: true,
            $or: [
                {
                    assignedTo: req.user._id,
                },
                {
                    backupUser: req.user._id,
                },
            ],
        })
            .populate("assignedTo", "firstName lastName email")
            .populate("backupUser", "firstName lastName email")
            .populate("createdBy", "firstName lastName email")
            .sort({ createdAt: -1 });

        // Return user responsibilities
        res.status(200).json(responsibilities);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createResponsibility,
    getResponsibilities,
    getResponsibilityById,
    updateResponsibility,
    deleteResponsibility,
    getMyResponsibilities,
};