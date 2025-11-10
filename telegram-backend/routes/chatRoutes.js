// chatRoutes.js
// ------------------------------
// Routes for creating and managing chats
// ------------------------------

import express from "express";
import { protect } from "../controllers/authController.js";
import {
  accessPrivateChat,getUserChats,createGroupChat,deleteChat
} from "../controllers/chatController.js";

const router = express.Router();

// Protect all chat routes
router.use(protect);

// 🔹 Create new chat (single or group)
router.post("/", createGroupChat);

// 🔹 Get all chats for logged-in user
router.get("/", getUserChats);

// 🔹 Get single chat by ID
router.post("/access",accessPrivateChat);

// 🔹 Delete a chat
router.delete("/:id", deleteChat);

export default router;
