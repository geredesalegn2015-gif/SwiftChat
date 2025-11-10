import Chat from "../models/chatModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";


// Get chats for current user
export const getUserChats=catchAsync(async(req,res,next)=>{
const userId=req.user._id;
if(!userId) 
  return next( new AppError("You are not logged in. Please login to get access.",401));
const chats=await Chat.find({participants:userId})
.populate("participants","fullName profilePic")
.populate("lastMessage")
.sort({updatedAt:-1});
if(!chats) 
  return next( new AppError("No chats found. Please create chat.",404));
return res.status(200).json({
  status:"success",
  quantity:chats.length,
  data:chats
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

export const accessPrivateChat=catchAsync(async(req,res,next)=>{
  const {userId}=req.body; //other user
  const me=req.user._id; // from protect midleware
  console.log("userId me",userId,me)
  let chat= await Chat.find({type:"private", participants:{$all:[userId,me],$size:2}});
  console.log("Existing chat",chat)
  
  if(chat.length===0){
    chat=await Chat.create({type:"private",participants:[userId,me]});
    console.log("new chat",chat)
  }
  return res.status(200).json({status:"success",data:chat});
})

export const createGroupChat=catchAsync(async(req,res)=>{
  const {name,participants}=req.body;
  const admin=req.userId;
  const newGroup= await Chat.create({name,type:"group",participants:[...participants,admin],admin});
  res.status(201).json({status:"success",message:"group created successfully",data:newGroup});
})

export const deleteChat=catchAsync(async(req,res)=>{
  console.log("delete current chat");
})