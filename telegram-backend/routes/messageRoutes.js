// messageRoutes.js
// ------------------------------
// Routes for sending and fetching messages
// ------------------------------

import express from "express";
import { protect } from "../controllers/authController.js";
import { sendMessage, getMessages } from "../controllers/messageController.js";

const router = express.Router();

// Protect all message routes
router.use(protect);

// 🔹 Send a message in a chat
router.post("/", sendMessage);

// 🔹 Get all messages for a specific chat
router.get("/:chatId", getMessages);

export default router;
