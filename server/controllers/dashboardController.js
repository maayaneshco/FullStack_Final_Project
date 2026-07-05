const Project = require("../models/Project");
const Task = require("../models/Task");
const Inventory = require("../models/inventoryModel");
const Equipment = require("../models/Equipment");
const Booking = require("../models/Booking");
const Protocol = require("../models/Protocol");

// Get dashboard data
const getDashboard = async (req, res) => {
    try {

        const [
            totalProjects,
            totalTasks,
            openTasks,
            completedTasks,
            lowStockItems,
            expiredInventory,
            availableEquipment,
            activeBookings,
            totalProtocols,
            recentProjects,
            recentTasks,
            recentBookings,
            recentProtocols,
        ] = await Promise.all([

            // Projects
            Project.countDocuments(),

            // Tasks
            Task.countDocuments(),

            Task.countDocuments({
                status: {
                    $in: [
                        "todo",
                        "in_progress",
                    ],
                },
            }),

            Task.countDocuments({
                status: "completed",
            }),

            // Inventory
            Inventory.countDocuments({
                isActive: true,
                $expr: {
                    $lte: [
                        "$quantity",
                        "$minimumQuantity",
                    ],
                },
            }),

            Inventory.countDocuments({
                isActive: true,
                expirationDate: {
                    $lt: new Date(),
                },
            }),

            // Equipment
            Equipment.countDocuments({
                isActive: true,
                status: "available",
            }),

            // Bookings
            Booking.countDocuments({
                status: "active",
            }),

            // Protocols
            Protocol.countDocuments({
                isActive: true,
            }),

            // Recent Projects
            Project.find()
                .populate(
                    "createdBy",
                    "firstName lastName email"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5),

            // Recent Tasks
            Task.find()
                .populate(
                    "createdBy",
                    "firstName lastName email"
                )
                .populate(
                    "project",
                    "title"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5),

            // Recent Bookings
            Booking.find()
                .populate(
                    "bookedBy",
                    "firstName lastName email"
                )
                .populate(
                    "equipment",
                    "name"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5),

            // Recent Protocols
            Protocol.find({
                isActive: true,
            })
                .populate(
                    "uploadedBy",
                    "firstName lastName email"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5),

        ]);
        // Return dashboard data
        res.status(200).json({

            summary: {

                totalProjects,

                totalTasks,

                openTasks,

                completedTasks,

                lowStockItems,

                expiredInventory,

                availableEquipment,

                activeBookings,

                totalProtocols,

            },

            recent: {

                projects: recentProjects,

                tasks: recentTasks,

                bookings: recentBookings,

                protocols: recentProtocols,

            },

        });

    } catch (error) {

        // Handle server errors
        res.status(500).json({
            message: error.message,
        });

    }
};

module.exports = {
    getDashboard,
};