import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();
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
  // Set your SendGrid API key
  sgMail.setApiKey(params["SENDGRID_API"]);

  router.post("/api/feedback", async (req, res) => {
    try {
      const { email, title, description } = req.body.data;

      const msg = {
        to: "sameery.020@gmail.com",
        from: email,
        subject: `EXIM Feedback | ${title}`,
        text: description,
        html: `<p>${description}</p>`,
      };

      await sgMail.send(msg);

      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ error: "An error occurred while sending the email" });
    }
  });
});

export default router;
