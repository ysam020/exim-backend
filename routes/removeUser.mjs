import express from "express";
import User from "../models/userModel.mjs";

const router = express.Router();

router.delete("/api/remove-user/:username", async (req, res) => {
  const username = req.params.username;

  try {
    // Use the User model to find the user by their username and delete it from the database
    const deletedUser = await User.findOneAndDelete({ username });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    // Handle any errors that might occur during the deletion process
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
