// server.js
// ------------------------------
// App entry point
// ------------------------------
import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import {setupSocket} from "./controllers/socketHandler.js"
import connectDB from "./config/db.js"
// Load environment variables
dotenv.config({ path: "./.env" });

//1) Connect to MongoDB
connectDB();
//2) Create http server and attach Socket.IO 
const server=http.createServer(app);
setupSocket(server) //3)initialize socket setup here

//4) Start the combined server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`🚀 App running on port ${port}...`);
});
