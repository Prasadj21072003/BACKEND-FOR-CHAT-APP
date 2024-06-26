import express from "express";
import Verify from "../Verify.js";
import {
  getmsg,
  getuserforsidebar,
  sendmsg,
} from "../controllers/msgcontroller.js";

const router = express.Router();

router.get("/conversations", Verify, getuserforsidebar);
router.post("/sendmsg/:id", Verify, sendmsg);
router.get("/:id", Verify, getmsg);

export default router;
