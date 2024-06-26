import express from "express";
import authroutes from "./routes/authroutes.js";
import messageroutes from "./routes/messageroutes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { app, server } from "./socket/Socket.js";
dotenv.config();
const PORT: Number | String = process.env.PORT || 5000;

app.use(
  cors({
    origin: "https://cozy-kangaroo-90c390.netlify.app",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.json("hello");
  console.log("hello");
});

app.use("/api/auth", authroutes);
app.use("/api/message", messageroutes);

server.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
