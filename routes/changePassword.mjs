import express from "express";
import bcrypt from "bcrypt"; // Import bcrypt library
import User from "../models/userModel.mjs";

const router = express.Router();

router.post("/api/changePassword", async (req, res) => {
  const { email, password, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not registered" });
    }

    // Password matched, now compare OTP
    if (otp === user.changePasswordOtp) {
      // OTP matched as well
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
      user.changePasswordOtp = undefined;
      user.password = hashedPassword; // Save the hashed password
      await user.save(); // Make sure to await the save operation

      return res.json({
        message: "Successfully Changed Password",
      });
    } else {
      return res.json({ message: "OTP didn't match" });
    }
  } catch (err) {
    console.error(err);
    return res.json({ message: "Something went wrong" });
  }
});

export default router;
