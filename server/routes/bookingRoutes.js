const express = require("express");

const router = express.Router();

const {
    createBooking,
    getBookings,
} = require("../controllers/bookingController");

const {
    protect,
} = require("../middleware/authMiddleware");

// Create booking
router.post(
    "/",
    protect,
    createBooking
);

// Get all bookings
router.get(
    "/",
    protect,
    getBookings
);

module.exports = router;