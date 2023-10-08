import express from "express";
import User from "../models/userModel.mjs";
import ReportFieldsModel from "../models/reportFieldsModel.mjs";

const router = express.Router();

router.post("/api/removeJobs", async (req, res) => {
  try {
    const data = req.body;
    const { username, importers } = data;

    const user = await User.findOne({ username });

    if (!user) {
      // User not found
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user.importers is defined and is an array before modifying it
    if (user.importers && Array.isArray(user.importers)) {
      // Extract importer names from the provided importers array
      const importersToRemove = importers.map(
        (importerObj) => importerObj.importer
      );

      // Remove importers whose names are included in importersToRemove
      user.importers = user.importers.filter(
        (importerObj) => !importersToRemove.includes(importerObj.importer)
      );

      // Save the updated user document
      await user.save();
    }

    // Delete documents from the reportFields collection
    const deletedReportFields = await ReportFieldsModel.deleteMany({
      senderEmail: user.email,
      importerURL: {
        $in: importers.map((importerObj) => importerObj.importerURL),
      },
    });

    // Successfully updated, you can send back the updated user or a success message.
    res.status(200).json({ message: "Importers removed successfully", user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
