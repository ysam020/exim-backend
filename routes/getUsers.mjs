import express from "express";
import User from "../models/userModel.mjs";

const router = express.Router();

router.get("/api/getUsers", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
