import Chat from "../models/chatModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Message from "../models/messageModel.js"

// Get chats for current user
export const getUserChats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  if (!userId)
    return next(new AppError("You are not logged in. Please login to get access.", 401));

  // ✅ Fetch chats with participants + lastMessage populated
  let chats = await Chat.find({ participants: userId })
    .populate("participants", "fullName profilePic")
    .populate({
      path: "lastMessage",
      select: "text media sender createdAt",
      populate: { path: "sender", select: "fullName" },
    })
    .sort({ updatedAt: -1 });

  if ( chats.length === 0)
    return next(new AppError("No chats found. Please create chat.", 404));

  // ✅ Add unread message count to each chat
  const chatsWithUnread = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        seenBy: { $ne: userId },
        sender: { $ne: userId },
      });
      return { ...chat.toObject(), unreadCount };
    })
  );
  

  return res.status(200).json({
    status: "success",
    quantity: chatsWithUnread?.length,
    data:chatsWithUnread,
  });
});

//////////////////////////////////////////////////////////////////


// export const getUserChats = catchAsync(async (req, res, next) => {
//   const userId = req.user?._id || "6908ab0038dda292133a925c"; // fake user for testing
//   console.log("🧪 Using dummy userId:", userId);

//   // ✅ Dummy chat data (simulates populated chat documents)
//   const dummyChats = [
//     {
//       _id: "chat001",
//       type: "private",
//       members: [
//         { _id: "6908ab0038dda292133a925c", fullName: "John Doe", profilePic: "/uploads/john.jpg" },
//         { _id: "6908aae738dda292133a925a", fullName: "Jane Smith", profilePic: "/uploads/jane.jpg" },
//       ],
//       lastMessage: {
//         _id: "msg001",
//         text: "Hey, how are you?",
//         sender: "6908aae738dda292133a925a",
//         createdAt: "2025-11-08T12:10:00.000Z",
//       },
//       updatedAt: "2025-11-08T12:10:00.000Z",
//     },
//     {
//       _id: "chat002",
//       type: "group",
//       name: "Developers Chat",
//       members: [
//         { _id: "6908ab0038dda292133a925c", fullName: "John Doe", profilePic: "/uploads/john.jpg" },
//         { _id: "6908aae738dda292133a925a", fullName: "Jane Smith", profilePic: "/uploads/jane.jpg" },
//         { _id: "6908abc838dda292133a925e", fullName: "Alex Turner", profilePic: "/uploads/alex.jpg" },
//       ],
//       lastMessage: {
//         _id: "msg002",
//         text: "Let's meet tomorrow for code review.",
//         sender: "6908abc838dda292133a925e",
//         createdAt: "2025-11-08T09:00:00.000Z",
//       },
//       updatedAt: "2025-11-08T09:00:00.000Z",
//     },
//   ];

//   // ✅ Simulate DB delay (optional)
//   await new Promise((resolve) => setTimeout(resolve, 300));

//   return res.status(200).json({
//     status: "success",
//     quantity: dummyChats.length,
//     data: dummyChats,
//   });
// });


/////////////////////////////////////////////////////////////////////

export const accessPrivateChat = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const me = req.user._id;

  if (!userId) return next(new AppError("User ID required", 400));

  // ✅ 1. Use findOne instead of find (returns single chat object)
  let chat = await Chat.findOne({
    type: "private",
    participants: { $all: [userId, me], $size: 2 },
  })
    // ✅ 2. Fix populate typo and include text, media, and sender
    .populate("participants", "fullName profilePic")
    .populate({
      path: "lastMessage",
      select: "text media sender createdAt",
      populate: { path: "sender", select: "fullName" },
    });

  // ✅ 3. Create new chat if not found
  if (!chat) {
    chat = await Chat.create({
      type: "private",
      participants: [userId, me],
    });

    // repopulate after creation
    chat = await Chat.findById(chat._id).populate("participants", "fullName profilePic");
  }

  // ✅ 4. Calculate unread messages count for this user
  const unreadCount = await Message.countDocuments({
    chat: chat._id,
    readBy: { $ne: me },
    sender: { $ne: me },
  });

  // ✅ 5. Return a single clean object with unreadCount added
  const formattedChat = {
    ...chat.toObject(),
    unreadCount,
  };

  return res.status(200).json({
    status: "success",
    data: formattedChat,
  });
});

export const createGroupChat=catchAsync(async(req,res)=>{
  const {name,participants}=req.body;
  const admin=req.userId;
  const newGroup= await Chat.create({name,type:"group",participants:[...participants,admin],admin});
  res.status(201).json({status:"success",message:"group created successfully",data:newGroup});
})

export const deleteChat=catchAsync(async(req,res)=>{
  console.log("delete current chat");
})