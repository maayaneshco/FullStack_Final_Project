const express = require("express");

const router = express.Router();

const {
    createInventoryItem,
    getInventoryItems,
    getInventoryItemById,
    updateInventoryItem,
    deleteInventoryItem,
    getLowStockItems,
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

// Get low stock inventory items
router.get(
    "/low-stock",
    protect,
    getLowStockItems
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