import Message from "../models/messageModel.js";
import Chat from "../models/chatModel.js";
import catchAsync from "../utils/catchAsync.js";
import fs from "fs";
import path from "path";

/**
 * -----------------------------
 * File upload helper (KEEP exactly as you provided)
 * -----------------------------
 * Handles media files uploaded via Express (via multer).
 * Saves files to /uploads and returns an array of file metadata.
 * Each object: { url, type, name, size }
 */
export const handleFileUpload = async (mediaFiles) => {
  if (!mediaFiles || mediaFiles.length === 0) return [];

  const uploaded = [];
  const uploadDir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  for (const file of mediaFiles) {
    const fileName = Date.now() + "_" + file.originalname;
    const filePath = path.join(uploadDir, fileName);

    // Determine the buffer correctly
    let fileBuffer;
    if (file.buffer instanceof ArrayBuffer) {
      fileBuffer = Buffer.from(file.buffer);
    } else if (Buffer.isBuffer(file.buffer)) {
      fileBuffer = file.buffer;
    } else {
      throw new Error("Invalid file buffer type");
    }

    // Write file to disk
    fs.writeFileSync(filePath, fileBuffer);

    // Safely handle mimetype
    let fileType = "document"; // default
    if (file.mimetype && typeof file.mimetype === "string") {
      fileType = file.mimetype.split("/")[0]; // image, video, audio, etc.
    }

    uploaded.push({
      url: `/uploads/${fileName}`,
      type: fileType,
      name: file.originalname || fileName,
      size: file.size || fileBuffer.length,
    });
  }

  return uploaded;
};

/**
 * -----------------------------
 * HTTP endpoint to upload media files
 * Route: POST /api/upload
 *
 * NOTE: This handler expects multer middleware to have populated `req.files`.
 * Example route wiring in your Express app:
 *
 *   import multer from "multer";
 *   const upload = multer(); // memory storage
 *   app.post("/api/upload", upload.array("mediaFiles", 10), uploadMedia);
 *
 * The uploadMedia handler below will call handleFileUpload(req.files) and return
 * the uploaded metadata to the client (so the client can send file URLs via socket).
 * -----------------------------
 */
export const uploadMedia = catchAsync(async (req, res) => {
  // req.files comes from multer middleware
  const files = req.files || [];
  const uploaded = await handleFileUpload(files);

  // respond with the list of uploaded metadata objects
  res.status(200).json({ files: uploaded });
});

/**
 * -----------------------------
 * Send a new message via Express API
 * Supports text, media, or both
 * -----------------------------
 */
export const sendMessage = catchAsync(async (req, res) => {
  const { chatId, text } = req.body;
  const mediaFiles = req.files || []; // from multer or other upload middleware

  // If this route is used for direct REST message creation with multipart,
  // go ahead and save uploaded media using helper.
  const media = await handleFileUpload(mediaFiles);

  // Validation: must have at least text or media
  if (!text && media.length === 0) {
    return res.status(400).json({
      status: "fail",
      message: "Message must contain text or media",
    });
  }

  // Create message in DB
  const message = await Message.create({
    chat: chatId,
    sender: req.user._id,
    text: text || "",
    media,
  });

  // Update chat's lastMessage (store ObjectId only!)
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
  });

  res.status(201).json({ status: "success", data: { message } });
});

/**
 * -----------------------------
 * Get all messages for a chat
 * -----------------------------
 */
export const getMessages = catchAsync(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "fullName email profilePic")
    .sort("createdAt");

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: messages,
  });
});

/**
 * -----------------------------
 * Socket-compatible message creation
 * Accepts either:
 *  - mediaFiles that are raw file objects (if client sent binary via socket) OR
 *  - mediaFiles that are already-uploaded metadata objects [{url,type,name,size}, ...]
 *
 * Behavior:
 *  - If mediaFiles appear to be raw file objects (have 'originalname' or 'buffer'),
 *    call handleFileUpload() to persist them and convert to metadata.
 *  - If mediaFiles already contain 'url' fields, treat them as metadata and save directly.
 *
 * The typical new flow (recommended):
 *  - Client uploads files to /api/upload (HTTP) → server returns metadata
 *  - Client emits socket event containing only text + metadata (not binary)
 *  - sendMessageSocket saves message and returns DB document
 * -----------------------------
 */
export const sendMessageSocket = async ({ chatId, senderId, text, mediaFiles }) => {
  // If mediaFiles are raw (from socket) they will likely have 'originalname' or 'buffer'.
  // If they are already uploaded metadata, they will have 'url' property.
  let media = [];

  if (mediaFiles && mediaFiles.length > 0) {
    const first = mediaFiles[0];

    const looksLikeUploadedMetadata = first && first.url && typeof first.url === "string";
    if (looksLikeUploadedMetadata) {
      // mediaFiles already contain { url, type, name, size } — proceed directly
      media = mediaFiles;
    } else {
      // mediaFiles are raw (e.g., from multer-like socket transfer). Persist them:
      media = await handleFileUpload(mediaFiles);
    }
  }

  if (!text && media.length === 0) {
    throw new Error("Message must contain text or media");
  }

  // Create message
  const message = await Message.create({
    chat: chatId,
    sender: senderId,
    text: text || "",
    media,
  });

  // Update chat's lastMessage field (ObjectId only!)
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
  });

  return message;
};
