const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Equipment = require("../models/Equipment");

// Create booking
const createBooking = async (req, res) => {
    try {
        const {
            equipment,
            startTime,
            endTime,
            purpose,
        } = req.body;

        // Check if equipment ID is valid
        if (!mongoose.Types.ObjectId.isValid(equipment)) {
            return res.status(400).json({
                message: "Invalid equipment ID",
            });
        }

        // Check that start time is before end time
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({
                message: "Start time must be before end time",
            });
        }

        // Check if equipment exists
        const equipmentItem = await Equipment.findById(
            equipment
        );

        if (!equipmentItem) {
            return res.status(404).json({
                message: "Equipment not found",
            });
        }

        // Check if equipment is active
        if (!equipmentItem.isActive) {
            return res.status(400).json({
                message: "Equipment is inactive",
            });
        }

        // Check if equipment is available
        if (equipmentItem.status !== "available") {
            return res.status(400).json({
                message:
                    "Equipment is not available for booking",
            });
        }

        // Check for overlapping bookings
        const overlappingBooking =
            await Booking.findOne({
                equipment,
                status: "active",
                startTime: {
                    $lt: new Date(endTime),
                },
                endTime: {
                    $gt: new Date(startTime),
                },
            });

        if (overlappingBooking) {
            return res.status(400).json({
                message:
                    "Equipment is already booked for this time range",
            });
        }

        // Create booking
        const booking = await Booking.create({
            equipment,
            bookedBy: req.user._id,
            startTime,
            endTime,
            purpose,
            createdBy: req.user._id,
        });

        // Return created booking
        res.status(201).json(booking);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createBooking,
};