const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
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
                "reagent",
                "chemical",
                "consumable",
                "biological_sample",
                "antibody",
                "primer",
                "kit",
                "buffer",
                "medium",
                "equipment_part",
                "general",
            ],
        },

        unit: {
            type: String,
            required: true,
            enum: [
                "units",
                "boxes",
                "bottles",
                "tubes",
                "plates",
                "packs",
                "ml",
                "l",
                "mg",
                "g",
                "kg",
            ],
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        minimumQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        location: {
            type: String,
            trim: true,
        },

        supplier: {
            type: String,
            trim: true,
        },

        catalogNumber: {
            type: String,
            trim: true,
        },

        expirationDate: {
            type: Date,
        },

        responsibleUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        notes: {
            type: String,
            trim: true,
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

module.exports = mongoose.model("Inventory", inventorySchema);