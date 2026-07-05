const mongoose = require("mongoose");

const protocolSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
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
                "molecular_biology",
                "cell_culture",
                "histology",
                "animal_work",
                "imaging",
                "general",
            ],
        },

        fileName: {
            type: String,
            required: true,
        },

        originalFileName: {
            type: String,
            required: true,
        },

        filePath: {
            type: String,
            required: true,
        },

        fileType: {
            type: String,
            required: true,
        },

        fileSize: {
            type: Number,
            required: true,
        },

        uploadedBy: {
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
    "Protocol",
    protocolSchema
);