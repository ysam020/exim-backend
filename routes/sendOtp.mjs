import express from "express";
import User from "../models/userModel.mjs";
import schedule from "node-schedule";
import sgMail from "@sendgrid/mail";
import AWS from "aws-sdk";

const parameters = {};
const ssm = new AWS.SSM({ region: "ap-south-1" });
const parameterNames = ["SENDGRID_API"];

// Create an async function to fetch parameters
async function fetchParameters() {
  try {
    const params = {
      Names: parameterNames,
      WithDecryption: true, // Decrypt SecureString parameters
    };

    const response = await ssm.getParameters(params).promise();

    // Extract parameter values
    response.Parameters.forEach((param) => {
      parameters[param.Name] = param.Value;
    });
  } catch (error) {
    console.error("Error fetching parameters:", error);
  }
}

// Call the function to fetch parameters and return a Promise
function getParameters() {
  return fetchParameters().then(() => parameters);
}

const router = express.Router();

getParameters().then((params) => {
  sgMail.setApiKey(params["SENDGRID_API"]);

  const removeOTP = async (userId) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.otp = null; // Remove OTP
        await user.save();
      }
    } catch (error) {
      console.error(`Error removing OTP: ${error}`);
    }
  };

  router.post("/api/sendOtp", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "User not registered" });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      console.log(otp);
      user.otp = otp;
      await user.save();

      // Schedule OTP removal after 5 minutes
      schedule.scheduleJob(`*/5 * * * *`, () => {
        removeOTP(user._id);
      });

      const msg = {
        to: email,
        from: "manu@surajforwarders.com",
        subject: "OTP for login to EXIM",
        text: `${otp} is the OTP to login to your EXIM account.`,
      };

      try {
        // Send the email
        await sgMail.send(msg);
        console.log("OTP sent successfully");
      } catch (error) {
        console.error(`Error sending email`, error);
      }

      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  });
});

export default router;
