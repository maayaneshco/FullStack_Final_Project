const express = require("express");

const {
    createResponsibility,
    getResponsibilities,
    getResponsibilityById,
    updateResponsibility,
    deleteResponsibility,
    getMyResponsibilities,
} = require("../controllers/responsibilityController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get all active responsibilities
router.get(
    "/",
    protect,
    getResponsibilities
);

// Get responsibilities of logged-in user
router.get(
    "/my",
    protect,
    getMyResponsibilities
);

// Get responsibility by ID
router.get(
    "/:id",
    protect,
    getResponsibilityById
);

// Create responsibility (Admin only)
router.post(
    "/",
    protect,
    authorize("admin"),
    createResponsibility
);

// Update responsibility (Admin only)
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateResponsibility
);

// Delete responsibility (Soft Delete - Admin only)
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteResponsibility
);

module.exports = router;