const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(
            null,
            path.join(
                __dirname,
                "../uploads/protocols"
            )
        );
    },

    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() +
                "-" +
                file.originalname.replace(/\s+/g, "_")
        );
    },
});

// Allowed file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only PDF, DOC and DOCX files are allowed"
            ),
            false
        );
    }
};

// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

module.exports = upload;