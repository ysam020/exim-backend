import express from "express";
import LastJobsDate from "../models/jobsLastUpdatedOnModel.mjs";

const router = express.Router();

router.post("/api/updateJobsDate", async (req, res) => {
  try {
    const { date } = req.body; // Assuming the date is present in the request body

    // Check if a document already exists in the database
    const existingDateDocument = await LastJobsDate.findOne();

    if (existingDateDocument) {
      // If a document exists, update its date field
      existingDateDocument.date = date;
      await existingDateDocument.save();
    } else {
      // If no document exists, create a new one and save it to the database
      const jobsLastUpdatedOn = new LastJobsDate({ date });
      await jobsLastUpdatedOn.save();
    }

    res.send("ok");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the date.");
  }
});

export default router;
