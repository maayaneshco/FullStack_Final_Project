const express = require("express");

const router = express.Router();

const {
    createInventoryItem,
    getInventoryItems,
    getInventoryItemById,
    updateInventoryItem,
    deleteInventoryItem,
} = require("../controllers/inventoryController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

// Get all inventory items
router.get(
    "/",
    protect,
    getInventoryItems
);

// Get inventory item by ID
router.get(
    "/:id",
    protect,
    getInventoryItemById
);

// Update inventory item
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateInventoryItem
);

// Delete inventory item
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteInventoryItem
);

// Create inventory item
router.post(
    "/",
    protect,
    authorize("admin"),
    createInventoryItem
);

module.exports = router;