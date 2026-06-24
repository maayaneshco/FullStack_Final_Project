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

module.exports = {
    createInventoryItem,
};