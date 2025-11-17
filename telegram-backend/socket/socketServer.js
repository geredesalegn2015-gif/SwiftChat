// backend/socket/socketServer.js
import { Server } from "socket.io";
import { registerUserHandler } from "./handlers/registerHandler.js";
import { joinHandler } from "./handlers/joinHandler.js";
import { privateMessageHandler } from "./handlers/privateMessageHandler.js";
import { groupMessageHandler } from "./handlers/groupMessageHandler.js";
import { seenHandler } from "./handlers/seenHandler.js";
import { typingHandler } from "./handlers/typingHandler.js";
import { statusHandler } from "./handlers/statusHandler.js";

/**
 * setupSocket(server) - call this from your index.js after creating the HTTP server
 */
export function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    registerUserHandler(socket, io);
    joinHandler(socket);
    privateMessageHandler(socket, io);
    groupMessageHandler(socket, io);
    seenHandler(socket, io);
    typingHandler(socket, io);
    statusHandler(socket, io);
  });

  return io;
}
