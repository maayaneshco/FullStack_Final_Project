const path = require("path");
const Protocol = require("../models/Protocol");

// Create protocol
const createProtocol = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
        } = req.body || {};

        // Check required fields
        if (!title || !category) {
            return res.status(400).json({
                message: "Title and category are required",
            });
        }

        // Check if protocol file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: "Protocol file is required",
            });
        }

        // Check if active protocol already exists
        const existingProtocol =
            await Protocol.findOne({
                title,
                isActive: true,
            });

        if (existingProtocol) {
            return res.status(400).json({
                message:
                    "Protocol with this title already exists",
            });
        }

        // Create new protocol
        const protocol = await Protocol.create({
            title,
            description,
            category,

            fileName: req.file.filename,
            originalFileName:
                req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,

            uploadedBy: req.user._id,
        });

        // Return created protocol
        res.status(201).json(protocol);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get all active protocols
const getProtocols = async (req, res) => {
    try {
        const {
            title,
            category,
        } = req.query;

        // Build search filter
        const filter = {
            isActive: true,
        };

        // Search by title
        if (title) {
            filter.title = {
                $regex: title,
                $options: "i",
            };
        }

        // Search by category
        if (category) {
            filter.category = category;
        }

        // Get protocols
        const protocols = await Protocol.find(filter)
            .populate(
                "uploadedBy",
                "firstName lastName email"
            )
            .sort({
                createdAt: -1,
            });

        // Return protocols
        res.status(200).json(protocols);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get protocol by ID
const getProtocolById = async (req, res) => {
    try {
        // Find active protocol by ID
        const protocol = await Protocol.findOne({
            _id: req.params.id,
            isActive: true,
        }).populate(
            "uploadedBy",
            "firstName lastName email"
        );

        // Check if protocol exists
        if (!protocol) {
            return res.status(404).json({
                message: "Protocol not found",
            });
        }

        // Return protocol
        res.status(200).json(protocol);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Update protocol
const updateProtocol = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
        } = req.body || {};

        // Check if protocol exists
        const protocol = await Protocol.findOne({
            _id: req.params.id,
            isActive: true,
        });

        if (!protocol) {
            return res.status(404).json({
                message: "Protocol not found",
            });
        }

        // Check for duplicate title
        if (
            title &&
            title !== protocol.title
        ) {
            const existingProtocol =
                await Protocol.findOne({
                    title,
                    isActive: true,
                });

            if (existingProtocol) {
                return res.status(400).json({
                    message:
                        "Protocol with this title already exists",
                });
            }
        }

        // Update fields
        protocol.title =
            title ?? protocol.title;

        protocol.description =
            description ?? protocol.description;

        protocol.category =
            category ?? protocol.category;

        // Save changes
        const updatedProtocol =
            await protocol.save();

        // Return updated protocol
        res.status(200).json(updatedProtocol);

    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Download protocol file
const downloadProtocol = async (req, res) => {
    try {
        // Find active protocol by ID
        const protocol = await Protocol.findOne({
            _id: req.params.id,
            isActive: true,
        });

        // Check if protocol exists
        if (!protocol) {
            return res.status(404).json({
                message: "Protocol not found",
            });
        }

        // Download protocol file
        res.download(
            path.resolve(protocol.filePath),
            protocol.originalFileName
        );
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Delete protocol (Soft Delete - Admin only)
const deleteProtocol = async (req, res) => {
    try {
        // Find protocol by ID
        const protocol = await Protocol.findById(
            req.params.id
        );

        // Check if protocol exists
        if (!protocol) {
            return res.status(404).json({
                message: "Protocol not found",
            });
        }

        // Check if protocol is already inactive
        if (!protocol.isActive) {
            return res.status(400).json({
                message: "Protocol is already inactive",
            });
        }

        // Mark protocol as inactive
        protocol.isActive = false;

        // Save changes
        await protocol.save();

        // Return success message
        res.status(200).json({
            message: "Protocol deleted successfully",
        });
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createProtocol,
    getProtocols,
    getProtocolById,
    updateProtocol,
    downloadProtocol,
    deleteProtocol,
};