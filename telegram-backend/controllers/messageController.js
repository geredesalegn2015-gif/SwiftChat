import Message from "../models/messageModel.js";
import Chat from "../models/chatModel.js";
import catchAsync from "../utils/catchAsync.js";

// Send a new message
export const sendMessage = catchAsync(async (req, res) => {
  const message = await Message.create({
    chatId: req.body.chatId,
    sender: req.user._id,
    text: req.body.text,
  });

  // Update last message in chat
  await Chat.findByIdAndUpdate(req.body.chatId, {
    lastMessage: {
      text: req.body.text,
      sender: req.user._id,
      createdAt: Date.now(),
    },
  });

  res.status(201).json({ status: "success", data: { message } });
});

// Get all messages in a chat
export const getMessages = catchAsync(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "fullName email profilePic")
    .sort("createdAt");

  res.status(200).json({ status: "success", results: messages.length, data: messages });
});
