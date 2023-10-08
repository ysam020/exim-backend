import express from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel.mjs";

const router = express.Router();

router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not registered" });
    }

    bcrypt.compare(password, user.password, (passwordErr, passwordResult) => {
      if (passwordErr) {
        console.error(passwordErr);
        return res.json({ message: "Something went wrong" });
      }

      if (passwordResult) {
        user.save();

        return res.json({
          message: "Login Successful",
          username: user.username,
          email: user.email,
          role: user.role,
          importers: user.importers,
        });
      } else {
        return res.json({ message: "Password didn't match" });
      }
    });
  } catch (err) {
    console.error(err);
    return res.json({ message: "Something went wrong" });
  }
});

export default router;
