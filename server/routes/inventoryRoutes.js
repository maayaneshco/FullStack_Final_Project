const express = require("express");

const router = express.Router();

const {
    createInventoryItem,
} = require("../controllers/inventoryController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

// Create inventory item
router.post(
    "/",
    protect,
    authorize("admin"),
    createInventoryItem
);

module.exports = router;