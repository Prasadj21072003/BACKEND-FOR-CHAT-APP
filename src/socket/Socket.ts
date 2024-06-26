import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://cozy-kangaroo-90c390.netlify.app"],
    methods: ["GET", "POST"],
  },
});

export const getRecieverSocketId = (receiverId: string) => {
  return userSocketMap[receiverId];
};

const userSocketMap: { [key: string]: string } = {};

io.on("connection", (Socket) => {
  console.log("a user connected", Socket.id);

  const userid = Socket.handshake.query.userId as string;
  console.log("userid :" + userid);

  if (userid) {
    userSocketMap[userid] = Socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  Socket.on("disconnect", () => {
    console.log("user disconnected", Socket.id);
    delete userSocketMap[userid];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
