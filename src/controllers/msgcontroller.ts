import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { getRecieverSocketId, io } from "../socket/Socket.js";

interface user {
  id: string;
  fullName: string;
  profilepic: string;
}

//export interface IGetUserAuthInfoRequest extends Request {
//  user: user;
//}

declare global {
  namespace Express {
    export interface Request {
      user: user;
    }
  }
}

export const sendmsg = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const receiverid = req.params.id;
    const senderId = req.user.id;

    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, receiverid],
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: {
            set: [senderId, receiverid],
          },
        },
      });
    }

    const newmsg = await prisma.message.create({
      data: {
        senderId,
        body: message,
        conversationId: conversation.id,
      },
    });

    if (newmsg) {
      conversation = await prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          message: {
            connect: {
              id: newmsg.id,
            },
          },
        },
      });
    }

    const recieverSocketid = getRecieverSocketId(receiverid);
    if (recieverSocketid) {
      io.to(recieverSocketid).emit("newMessage", newmsg);
      console.log("receiverid : " + recieverSocketid);
    }

    res.json(newmsg);
  } catch (error) {
    res.json(error);
  }
};

export const getmsg = async (req: Request, res: Response) => {
  try {
    const receiverid = req.params.id;
    const senderId = req.user.id;
    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, receiverid],
        },
      },
      include: {
        message: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return res.json([]);
    }

    res.json(conversation.message);
  } catch (error) {
    res.json(error);
  }
};

export const getuserforsidebar = async (req: Request, res: Response) => {
  try {
    const senderId = req.user?.id;

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: senderId,
        },
      },
      select: {
        id: true,
        fullName: true,
        profilepic: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.log(error);
  }
};
