const express = require("express");

const router = express.Router();

const {
    createProtocol,
    getProtocols,
    getProtocolById,
    updateProtocol,
    downloadProtocol,
    deleteProtocol,
} = require("../controllers/protocolController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/protocolUpload");

// Get all protocols
router.get(
    "/",
    protect,
    getProtocols
);

// Get protocol by ID
router.get(
    "/:id",
    protect,
    getProtocolById
);

// Update protocol
router.put(
    "/:id",
    protect,
    updateProtocol
);

// Download protocol file
router.get(
    "/:id/download",
    protect,
    downloadProtocol
);

// Delete protocol
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteProtocol
);

// Create protocol
router.post(
    "/",
    protect,
    upload.single("file"),
    createProtocol
);

module.exports = router;