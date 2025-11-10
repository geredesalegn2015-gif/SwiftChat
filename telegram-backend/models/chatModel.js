import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  type: { type: String, enum:["private","group"],required:true },
  name: String,
  admin:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
  lastMessage: {
   type:mongoose.Schema.Types.ObjectId,ref:"Message"
  },
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
