import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import bcryptjs from "bcryptjs";
import { error } from "console";
import jwt from "jsonwebtoken";

export const get = (req: Request, res: Response) => {
  res.json("hello");
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, username, password, gender } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (user) {
      res.json("Username already exists");
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const boyprofilepic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlprofilepic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newuser = await prisma.user.create({
      data: {
        fullName,
        username,
        password: hashedPassword,
        gender,
        profilepic: gender === "male" ? boyprofilepic : girlprofilepic,
      },
    });

    if (newuser) {
      res.json({
        id: newuser.id,
        fullName: newuser.fullName,
        username: newuser.username,
        profilepic: newuser.profilepic,
      });
    } else {
      res.json({ error: "Invalid user data" });
    }
  } catch (error: any) {
    console.log(error);
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.json("User not found");
  }
  const ispasswordcorrect = await bcryptjs.compare(password, user.password);

  if (!ispasswordcorrect) {
    return res.json("Password is not correct");
  }

  const acesstoken = jwt.sign({ id: user.id }, process.env.JWT_KEY as string, {
    expiresIn: "5d",
  });

  res.cookie("jwt", acesstoken, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  res.json({
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    profilepic: user.profilepic,
    acesstoken: acesstoken,
  });
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.json({ error: "Internal Server Error" });
  }
};

export const getme = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    res.json({
      id: user?.id,
      fullname: user?.fullName,
      username: user?.username,
      profilepic: user?.profilepic,
    });
  } catch (error) {
    console.log(error);
    res.json({ error: "Internal Server Error" });
  }
};
