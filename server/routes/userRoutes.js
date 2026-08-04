const express = require("express");
const {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  updateUserRole,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin"), getUsers);

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

router.put("/:id/role", protect, authorize("admin"), updateUserRole);


module.exports = router;
