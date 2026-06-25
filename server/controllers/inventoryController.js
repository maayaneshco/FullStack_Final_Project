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

// Update inventory item (Admin only)
const updateInventoryItem = async (req, res) => {
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
            isActive,
        } = req.body;

        // Check if inventory item exists
        const inventoryItem = await Inventory.findById(
            req.params.id
        );

        if (!inventoryItem) {
            return res.status(404).json({
                message: "Inventory item not found",
            });
        }

        // Check for duplicate name
        if (name && name !== inventoryItem.name) {
            const existingItem = await Inventory.findOne({
                name,
            });

            if (existingItem) {
                return res.status(400).json({
                    message:
                        "Inventory item with this name already exists",
                });
            }
        }

        // Update fields
        inventoryItem.name =
            name ?? inventoryItem.name;

        inventoryItem.description =
            description ?? inventoryItem.description;

        inventoryItem.category =
            category ?? inventoryItem.category;

        inventoryItem.unit =
            unit ?? inventoryItem.unit;

        inventoryItem.quantity =
            quantity ?? inventoryItem.quantity;

        inventoryItem.minimumQuantity =
            minimumQuantity ??
            inventoryItem.minimumQuantity;

        inventoryItem.location =
            location ?? inventoryItem.location;

        inventoryItem.supplier =
            supplier ?? inventoryItem.supplier;

        inventoryItem.catalogNumber =
            catalogNumber ??
            inventoryItem.catalogNumber;

        inventoryItem.expirationDate =
            expirationDate ??
            inventoryItem.expirationDate;

        inventoryItem.responsibleUser =
            responsibleUser ??
            inventoryItem.responsibleUser;

        inventoryItem.notes =
            notes ?? inventoryItem.notes;

        inventoryItem.isActive =
            isActive ?? inventoryItem.isActive;

        // Save changes
        const updatedInventoryItem =
            await inventoryItem.save();

        // Return updated inventory item
        res.status(200).json(updatedInventoryItem);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Delete inventory item (Soft Delete - Admin only)
const deleteInventoryItem = async (req, res) => {
    try {
        // Find inventory item by ID
        const inventoryItem = await Inventory.findById(
            req.params.id
        );

        // Check if inventory item exists
        if (!inventoryItem) {
            return res.status(404).json({
                message: "Inventory item not found",
            });
        }

        // Check if inventory item is already inactive
        if (!inventoryItem.isActive) {
            return res.status(400).json({
                message: "Inventory item is already inactive",
            });
        }

        // Mark inventory item as inactive
        inventoryItem.isActive = false;

        // Save changes
        await inventoryItem.save();

        // Return success message
        res.status(200).json({
            message: "Inventory item deleted successfully",
        });
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
    updateInventoryItem,
    deleteInventoryItem,
};