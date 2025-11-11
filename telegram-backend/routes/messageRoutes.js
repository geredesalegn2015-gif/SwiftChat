// messageRoutes.js
// ------------------------------
// Routes for sending and fetching messages
// ------------------------------
import multer from "multer"
import express from "express";
import { protect } from "../controllers/authController.js";
import { sendMessage, getMessages,uploadMedia } from "../controllers/messageController.js";

const router = express.Router();
const upload = multer(); // memory storage
// Protect all message routes
router.use(protect);

// 🔹 Send a message in a chat
router.post("/", sendMessage);

//upload files
router.post("/upload",upload.array("mediaFiles", 10),uploadMedia)
// 🔹 Get all messages for a specific chat
router.get("/:chatId", getMessages);

export default router;
