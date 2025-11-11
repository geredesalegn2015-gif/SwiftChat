import mongoose from "mongoose";

// Message schema
// - chat: reference to Chat document (required)
// - sender: reference to User document (required)
// - text: optional textual content
// - media: array of uploaded files metadata; each object:
//     { url: string, type: "image"|"video"|"audio"|"document", name, size }
// - deliveredTo / seenBy: arrays of User ObjectIds for read/delivery tracking
const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    media: [
      {
        url: { type: String, required: true }, // relative or absolute URL to serve
        type: { type: String, enum: ["image", "video", "audio", "document"], required: true },
        name: { type: String },
        size: { type: Number },
      },
    ],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
