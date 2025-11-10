// authRoutes.js
// ------------------------------
// Routes for authentication (signup, login, protect)
// ------------------------------

import express from "express";
//import { signup, login, protect ,logout} from "../controllers/authController.js";
import { signup, login ,logout} from "../controllers/authController.js";

const router = express.Router();

// 🚀 Signup new user
router.post("/signup", signup);

// 🚀 Login existing user
router.post("/login", login);

// Protected route: logout (requires login)
//router.get("/logout", protect, logout);
router.get("/logout",  logout);

// You can add more auth routes here (password reset, etc.)

export default router;
