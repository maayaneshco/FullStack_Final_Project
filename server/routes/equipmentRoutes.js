const express = require("express");

const router = express.Router();

const {
    createEquipment,
    getEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment,
} = require("../controllers/equipmentController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

// Get all equipment
router.get(
    "/",
    protect,
    getEquipment
);

// Get equipment by ID
router.get(
    "/:id",
    protect,
    getEquipmentById
);

// Update equipment
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateEquipment
);

// Delete equipment
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteEquipment
);

// Create equipment
router.post(
    "/",
    protect,
    authorize("admin"),
    createEquipment
);

module.exports = router;