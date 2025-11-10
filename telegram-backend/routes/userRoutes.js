// userRoutes.js
// ------------------------------
// Routes for user management (profile, CRUD)
// ------------------------------

import express from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getMe,
   searchUsers,
  updateMe,
  deleteMe,
} from "../controllers/userController.js";
import { protect } from "../controllers/authController.js";
import { uploadUserPhoto, resizeUserPhoto } from "../middlewares/uploadUserPhoto.js";

const router = express.Router();

// All routes below require the user to be logged in
router.use(protect);
router.get("/search", searchUsers);
// 🔹 Get current user's profile
router.get("/me", getMe, getUser);

// 🔹 Update current user's profile (name, email, photo)
router.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);

// 🔹 Delete current user
router.delete("/deleteMe", deleteMe);

// 🔹 Admin routes (CRUD)
router.route("/").get(getAllUsers);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
