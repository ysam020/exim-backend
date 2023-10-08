import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API);

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

export default router;
