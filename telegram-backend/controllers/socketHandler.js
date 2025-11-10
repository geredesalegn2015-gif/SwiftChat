import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import { Server } from "socket.io";
export function setupSocket(server){
 const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // your frontend
      credentials: true,
    },
  });
    // In-memory map to keep track of online users.
    //nMaps userId->socketId
  const onlineUsers=new Map();

  io.on("connection",(socket)=>{

    console.log("Socket connected:",socket.id);

    /**
     *  registerUser - called immediately by client afterconnection.
     *  Client emits this event with their MongoDB userId after successful login.
     * We store it in onlineUsers so we can delivermessages directly to them.
     */
    socket.on("registerUser",(userId)=>{
        onlineUsers.set(userId,socket.id);
        console.log(`Registered user: ${userId}-> ${socket.id}`);
    });

    /**
     * PRIVATE MESSAGE HANDLER
     * senderId,receiverId, and text come from the client.
     * The server ensures that private chats are reused not recreated.
     */
    socket.on("privateMessage",async({senderId,receiverId,text})=>{
        try {
            console.log(senderId,receiverId,text)
            //1) Find existing chat or create a new one.
            let chat=await Chat.findOne({
                type:"private",
                participants:{$all:[senderId,receiverId],$size:2},
             });

             if(!chat){
                chat=await Chat.create({
                    type:"private",
                    participants:[senderId,receiverId],
                });
             }

             //2) Create and save the message
             const message=await Message.create({
                chat:chat._id,
                sender:senderId,
                text,
             });

             //3) Update chat's last message reference.
             chat.lastMessage=message._id;
             await chat.save();

             //4)Send message to receiver (if online)
             const receiverSocket=onlineUsers.get(receiverId);
             if(receiverSocket){
                io.to(receiverSocket).emit("newPrivateMessage",message);
             }
             //5) Send message back to sender (so sender UI updates too)
             const senderSocket=onlineUsers.get(senderId);
             if(senderSocket){
                io.to(senderSocket).emit("newPrivateMessage",message);
             }
        } catch (error) {
            console.error("Private message error.",error);
        }
 });

 /**
  * GROUP MESSAGE HANDLER
  * senderId: who sends the message
  * groupId: MongoDB _id of the group Chat document
  * text: message content
  */
 socket.on("groupMessage", async({senderId,groupId,text})=>{
 try {
    //1) Ensure the group exists and is of type "group".
    const chat=await Chat.findOne({_id:groupId,type:"group"}).populate("participants");
    if(!chat) return console.log("Group not found",groupId);

    //2) Ensure sender is part of the group.
    const isMember=chat.participants.some((p)=>p._id.toString()===senderId);
    if(!isMember) return console.log("Sender not in group",senderId);

    //3) create the message.
    const message=await Message.create({
        chat:groupId,
        sender:senderId,
        text
    });

    //4) Update chat's last message field.
    chat.lastMessage=message._id;
    await chat.save();

    //5) Send to all online members of this group  (except sender).
    for( const member of chat.participants){
        if(member._id.toString()===senderId) continue; // don't send to self.
        const memberSocket=onlineUsers.get(member._id.toString());
        if(memberSocket){
            io.to(memberSocket).emit("newGroupMessage",{groupId,message});
        }
    }

    //6) Acknowledge sender's own message (update their chat window).
    const senderSocket=onlineUsers.get(senderId);
    if(senderSocket){
        io.to(senderSocket).emit("newGroupMessage",{groupId,message});
    }
 } catch (error) {
     console.error("Group message error.",error);
 }
 });

 /**
  * JOIN GROUP _ called when the user manually joins a new group
  * the client emits this when creating or joining a group.
  * We update the MongoDB Chat model to add them as a participant.
  */
 socket.on("joinGroup",async({userId,groupId})=>{
    try {
        const chat=Chat.findById(groupId);
        if(!chat) return console.log("Group not found.");

        //1) add user only if not already a member
        if(!chat.participants.includes(userId)){
            chat.participants.push(userId);
            await chat.save();
        }

        //2)  optionally join the socket room (for efficiency)
        socket.join(groupId);
        console.log(`user ${userId} joined group ${groupId}`);
        
        //3) notify group members (optional)
        io.to(groupId).emit("groupMemberJoined",{userId,groupId});
    } catch (error) {
             console.error("Group join error.",error);
    }
 });

 /**
  * LEAVE GROUP _ When user wants to leave a group
  * Removes them from MongoDB participants list.
  */
 socket.on("leaveGroup",async({userId,groupId})=>{
try {
     const chat=Chat.findById(groupId);
        if(!chat) return console.log("Group not found.");

        chat.participants=chat.participants.filter(
            (id)=>id.toString()!==userId);
            await chat.save();

            socket.leave(groupId);
            console.log(`user ${userId} left the group ${groupId}`);

            //notify group members (optional)
            io.to(groupId).emit("groupMemberLeft",{userId,groupId});
    
} catch (error) {
    console.error("Error leaving group",error)
}
 });

 /**
  * Handle user disconnect
  * Remove them from the onlineUsers map when they close the app or lose connection.
  */
 socket.on("disconnect",()=>{
    for(const [userId,sockId] of onlineUsers.entries()){
        if(sockId===socket.id){
            onlineUsers.delete(userId);
            console.log(`User disconnected:${userId}`);
            break;
        }
    }
 })

  })
}