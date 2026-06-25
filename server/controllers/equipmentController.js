const Equipment = require("../models/Equipment");

// Create equipment (Admin only)
const createEquipment = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            location,
            status,
        } = req.body;

        // Check if equipment already exists
        const existingEquipment =
            await Equipment.findOne({ name });

        if (existingEquipment) {
            return res.status(400).json({
                message:
                    "Equipment with this name already exists",
            });
        }

        // Create equipment
        const equipment = await Equipment.create({
            name,
            description,
            category,
            location,
            status,
            createdBy: req.user._id,
        });

        // Return created equipment
        res.status(201).json(equipment);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get all active equipment
const getEquipment = async (req, res) => {
    try {
        // Get active equipment only
        const equipment = await Equipment.find({
            isActive: true,
        })
            .populate(
                "createdBy",
                "firstName lastName email"
            )
            .sort({ createdAt: -1 });

        // Return equipment list
        res.status(200).json(equipment);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get equipment by ID
const getEquipmentById = async (req, res) => {
    try {
        // Find equipment by ID
        const equipment =
            await Equipment.findById(req.params.id)
                .populate(
                    "createdBy",
                    "firstName lastName email"
                );

        // Check if equipment exists
        if (!equipment) {
            return res.status(404).json({
                message: "Equipment not found",
            });
        }

        // Return equipment
        res.status(200).json(equipment);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Update equipment (Admin only)
const updateEquipment = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            location,
            status,
            isActive,
        } = req.body;

        // Check if equipment exists
        const equipment =
            await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({
                message: "Equipment not found",
            });
        }

        // Check duplicate name
        if (
            name &&
            name !== equipment.name
        ) {
            const existingEquipment =
                await Equipment.findOne({ name });

            if (existingEquipment) {
                return res.status(400).json({
                    message:
                        "Equipment with this name already exists",
                });
            }
        }

        // Update fields
        equipment.name =
            name ?? equipment.name;

        equipment.description =
            description ??
            equipment.description;

        equipment.category =
            category ?? equipment.category;

        equipment.location =
            location ?? equipment.location;

        equipment.status =
            status ?? equipment.status;

        equipment.isActive =
            isActive ?? equipment.isActive;

        // Save changes
        const updatedEquipment =
            await equipment.save();

        // Return updated equipment
        res.status(200).json(updatedEquipment);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Soft delete equipment (Admin only)
const deleteEquipment = async (req, res) => {
    try {
        // Find equipment
        const equipment =
            await Equipment.findById(req.params.id);

        // Check if equipment exists
        if (!equipment) {
            return res.status(404).json({
                message: "Equipment not found",
            });
        }

        // Check if already inactive
        if (!equipment.isActive) {
            return res.status(400).json({
                message:
                    "Equipment is already inactive",
            });
        }

        // Soft delete
        equipment.isActive = false;

        await equipment.save();

        // Return success
        res.status(200).json({
            message:
                "Equipment deleted successfully",
        });
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createEquipment,
    getEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment,
};