const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            enum: [
                "microscope",
                "centrifuge",
                "pcr_machine",
                "incubator",
                "freezer",
                "sequencer",
                "imaging",
                "general",
            ],
        },

        location: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "available",
                "maintenance",
                "out_of_service",
            ],
            default: "available",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Equipment",
    equipmentSchema
);