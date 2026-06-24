const mongoose = require("mongoose");

const responsibilitySchema = new mongoose.Schema(
    {
        // Responsibility title
        title: {
            type: String,
            required: [true, "Responsibility title is required"],
            trim: true,
            unique: true,
        },

        // Responsibility description
        description: {
            type: String,
            trim: true,
            default: "",
        },

        // Responsibility category
        category: {
            type: String,
            enum: [
                "animal_care",
                "chemical_inventory",
                "cell_culture",
                "equipment",
                "freezer_monitoring",
                "protocols",
                "safety",
                "general",
            ],
            default: "general",
        },

        // Main responsible user
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Backup responsible user
        backupUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Responsibility start date
        startDate: {
            type: Date,
            default: Date.now,
        },

        // Responsibility end date
        endDate: {
            type: Date,
            default: null,
        },

        // Active / inactive status
        isActive: {
            type: Boolean,
            default: true,
        },

        // User who created the responsibility
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        // Automatically create createdAt and updatedAt
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Responsibility",
    responsibilitySchema
);