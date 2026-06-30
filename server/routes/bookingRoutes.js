const express = require("express");

const router = express.Router();

const {
    createBooking,
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

module.exports = router;