import express from "express";
import LastJobsDate from "../models/jobsLastUpdatedOnModel.mjs";

const router = express.Router();

router.get("/api/getLastJobsDate", async (req, res) => {
  try {
    // Fetch the latest document based on the 'date' field
    const lastJobsDateDocument = await LastJobsDate.findOne(
      {},
      { _id: 0 }
    ).sort({
      date: -1,
    });

    if (!lastJobsDateDocument) {
      // Handle the case where no documents are found in the collection
      return res.status(404).json({ error: "No data found." });
    }

    // Extract the 'date' field from the document and send it as a response
    const lastJobsDate = lastJobsDateDocument.date;
    res.json({ lastJobsDate });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data." });
  }
});

export default router;
