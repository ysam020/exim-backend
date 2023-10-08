import express from "express";
import User from "../models/userModel.mjs";
import ReportFieldsModel from "../models/reportFieldsModel.mjs";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API);

router.post("/api/assignJobs", async (req, res) => {
  const data = req.body;
  console.log(data);
  const { username, importers } = data;

  try {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }

    for (const importerObj of importers) {
      const { importer, importerURL } = importerObj;

      // Check if the importer already exists in the reporterFields collection
      const existingImporter = await ReportFieldsModel.findOne({ importer });

      if (!existingImporter) {
        // If importer doesn't exist, create a new document
        const newData = {
          importer: importer,
          importerURL: importerURL,
          field: [
            "JOB NO",
            "JOB DATE",
            "SUPPLIER/ EXPORTER",
            "INVOICE NUMBER",
            "INVOICE DATE",
            "INVOICE VALUE AND UNIT PRICE",
            "AWB/ BL NUMBER",
            "AWB/ BL DATE",
            "COMMODITY",
            "NUMBER OF PACKAGES",
            "NET WEIGHT",
            "LOADING PORT",
            "ARRIVAL DATE",
            "FREE TIME",
            "DETENTION FROM",
            "SHIPPING LINE",
            "CONTAINER NUMBER",
            "SIZE",
            "REMARKS",
            "DO VALIDITY",
            "BE NUMBER",
            "BE DATE",
            "ASSESSMENT DATE",
            "EXAMINATION DATE",
            "DUTY PAID DATE",
            "OUT OF CHARGE DATE",
            "DETAILED STATUS",
          ],
          email: "manu@surajforwarders.com",
          senderEmail: foundUser.email,
        };

        await ReportFieldsModel.create(newData);
      }

      // Update the user's 'importers' array with the provided 'importers'
      importers.forEach(async (importerObj) => {
        const { importer, importerURL } = importerObj;
        const existingImporterIndex = foundUser.importers.findIndex(
          (existingImporter) => existingImporter.importer === importer
        );

        if (existingImporterIndex !== -1) {
          // If the importer already exists, update its importerURL
          foundUser.importers[existingImporterIndex].importerURL = importerURL;
        } else {
          // If the importer does not exist, add it to the importers array
          foundUser.importers.push(importerObj);
        }
      });
    }

    foundUser
      .save()
      .then((updatedUser) => {
        const assignedImportersCount = importers.length;
        const assignedImportersNames = importers.map(
          (importerObj) => importerObj.importer
        );

        const mailOptions = {
          to: foundUser.email,
          from: "manu@surajforwarders.com",
          subject: "Importers Assignment",
          text: `You have been assigned ${assignedImportersCount} importers: ${assignedImportersNames.join(
            ", "
          )}.`,
        };

        sgMail.send(mailOptions, (error, result) => {
          if (error) {
            console.error("Error sending email:", error);
            res.status(500).json({ error: "Error sending email" });
          } else {
            console.log("Email sent successfully");
            res.status(200).json(updatedUser);
          }
        });
      })
      .catch((err) => {
        console.error("Error while saving user:", err);
        res.status(500).json({ error: "Error while saving user" });
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
