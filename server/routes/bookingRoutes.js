const express = require("express");

const router = express.Router();

const {
    createBooking,
    getBookings,
    getMyBookings,
    getEquipmentBookings,
    cancelBooking,
} = require("../controllers/bookingController");

const {
    protect,
} = require("../middleware/authMiddleware");

// Get all bookings
router.get(
    "/",
    protect,
    getBookings
);

// Get logged-in user's bookings
router.get(
    "/my-bookings",
    protect,
    getMyBookings,
);

// Get bookings for a specific equipment
router.get(
    "/equipment/:equipmentId",
    protect,
    getEquipmentBookings
);

// Cancel booking
router.put(
    "/:id/cancel",
    protect,
    cancelBooking
);

// Create booking
router.post(
    "/",
    protect,
    createBooking
);

module.exports = router;