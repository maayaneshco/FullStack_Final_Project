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

// Get all bookings
const getBookings = async (req, res) => {
    try {
        // Get all bookings
        const bookings = await Booking.find()
            .populate(
                "equipment",
                "name category location status"
            )
            .populate(
                "bookedBy",
                "firstName lastName email"
            )
            .populate(
                "createdBy",
                "firstName lastName email"
            )
            .sort({ createdAt: -1 });

        // Return bookings
        res.status(200).json(bookings);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get logged-in user's bookings
const getMyBookings = async (req, res) => {
    try {
        // Get bookings created for the logged-in user
        const bookings = await Booking.find({
            bookedBy: req.user._id,
        })
            .populate(
                "equipment",
                "name category location status"
            )
            .populate(
                "bookedBy",
                "firstName lastName email"
            )
            .populate(
                "createdBy",
                "firstName lastName email"
            )
            .sort({ startTime: 1 });

        // Return user's bookings
        res.status(200).json(bookings);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get bookings for a specific equipment
const getEquipmentBookings = async (req, res) => {
    try {
        const { equipmentId } = req.params;

        // Check if equipment ID is valid
        if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
            return res.status(400).json({
                message: "Invalid equipment ID",
            });
        }

        // Get bookings for the selected equipment
        const bookings = await Booking.find({
            equipment: equipmentId,
        })
            .populate(
                "equipment",
                "name category location status"
            )
            .populate(
                "bookedBy",
                "firstName lastName email"
            )
            .populate(
                "createdBy",
                "firstName lastName email"
            )
            .sort({ startTime: 1 });

        // Return bookings
        res.status(200).json(bookings);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if booking ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid booking ID",
            });
        }

        // Find booking by ID
        const booking = await Booking.findById(id);

        // Check if booking exists
        if (!booking) {
            return res.status(404).json({
                message: "Booking not found",
            });
        }

        // Allow admin to cancel any booking
        // Allow researcher to cancel only their own booking
        if (
            req.user.role !== "admin" &&
            booking.bookedBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Not authorized to cancel this booking",
            });
        }

        // Check if booking is already cancelled
        if (booking.status === "cancelled") {
            return res.status(400).json({
                message: "Booking is already cancelled",
            });
        }

        // Cancel booking
        booking.status = "cancelled";

        // Save changes
        const cancelledBooking = await booking.save();

        // Return cancelled booking
        res.status(200).json(cancelledBooking);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

// Update booking
const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            startTime,
            endTime,
            purpose,
        } = req.body;

        // Check if booking ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid booking ID",
            });
        }

        // Find booking
        const booking = await Booking.findById(id);

        // Check if booking exists
        if (!booking) {
            return res.status(404).json({
                message: "Booking not found",
            });
        }

        // Check permissions
        if (
            req.user.role !== "admin" &&
            booking.bookedBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Not authorized to update this booking",
            });
        }

        // Determine updated values
        const newStartTime = startTime ?? booking.startTime;
        const newEndTime = endTime ?? booking.endTime;

        // Validate time range
        if (new Date(newStartTime) >= new Date(newEndTime)) {
            return res.status(400).json({
                message: "Start time must be before end time",
            });
        }

        // Check overlapping bookings (ignore current booking)
        const overlappingBooking = await Booking.findOne({
            _id: { $ne: booking._id }, // Ignore the current booking to prevent it from matching itself
            equipment: booking.equipment,
            status: "active",
            startTime: {
                $lt: new Date(newEndTime),
            },
            endTime: {
                $gt: new Date(newStartTime),
            },
        });

        if (overlappingBooking) {
            return res.status(400).json({
                message:
                    "Equipment is already booked for this time range",
            });
        }

        // Update booking
        booking.startTime = newStartTime;
        booking.endTime = newEndTime;
        booking.purpose = purpose ?? booking.purpose;

        // Save changes
        const updatedBooking = await booking.save();

        // Return updated booking
        res.status(200).json(updatedBooking);
    } catch (error) {
        // Handle server errors
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createBooking,
    getBookings,
    getMyBookings,
    getEquipmentBookings,
    cancelBooking,
    updateBooking,
};