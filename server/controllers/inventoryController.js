const Inventory = require("../models/inventoryModel");

// Create inventory item (Admin only)
const createInventoryItem = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            unit,
            quantity,
            minimumQuantity,
            location,
            supplier,
            catalogNumber,
            expirationDate,
            responsibleUser,
            notes,
        } = req.body;

        // Check if inventory item already exists
        const existingItem = await Inventory.findOne({
            name,
        });

        if (existingItem) {
            return res.status(400).json({
                message: "Inventory item with this name already exists",
            });
        }

        // Create new inventory item
        const inventoryItem = await Inventory.create({
            name,
            description,
            category,
            unit,
            quantity,
            minimumQuantity,
            location,
            supplier,
            catalogNumber,
            expirationDate,
            responsibleUser,
            notes,

            // Save creator from JWT token
            createdBy: req.user._id,
        });

        // Return created inventory item
        res.status(201).json(inventoryItem);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get all active inventory items
const getInventoryItems = async (req, res) => {
    try {
        // Get all active inventory items
        const inventoryItems = await Inventory.find({
            isActive: true,
        })
            .populate(
                "responsibleUser",
                "firstName lastName email"
            )
            .populate(
                "createdBy",
                "firstName lastName email"
            )
            .sort({ createdAt: -1 });

        // Return inventory items
        res.status(200).json(inventoryItems);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get inventory item by ID
const getInventoryItemById = async (req, res) => {
    try {
        // Find inventory item by ID
        const inventoryItem = await Inventory.findById(
            req.params.id
        )
            .populate(
                "responsibleUser",
                "firstName lastName email"
            )
            .populate(
                "createdBy",
                "firstName lastName email"
            );

        // Check if inventory item exists
        if (!inventoryItem) {
            return res.status(404).json({
                message: "Inventory item not found",
            });
        }

        // Return inventory item
        res.status(200).json(inventoryItem);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createInventoryItem,
    getInventoryItems,
    getInventoryItemById,
};