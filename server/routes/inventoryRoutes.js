const express = require("express");

const router = express.Router();

const {
    createInventoryItem,
    getInventoryItems,
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

// Create inventory item
router.post(
    "/",
    protect,
    authorize("admin"),
    createInventoryItem
);

module.exports = router;