import express from "express";
import JobModel from "../models/jobModel.mjs";
const router = express.Router();
router.post("/api/jobs/addJob", async (req, res) => {
  const jsonData = req.body;

  try {
    // Extract the unique identifiers (year and job_no) from the documents
    const uniqueIdentifiers = jsonData.map((data) => ({
      year: data.year,
      job_no: data.job_no,
    }));

    // Use bulkWrite to perform the insert or update in a batch
    const bulkOperations = uniqueIdentifiers.map((identifier) => {
      const dataToUpdate = jsonData.find(
        (data) =>
          data.year === identifier.year && data.job_no === identifier.job_no
      );
      // Set the status field based on the bill_date value
      const status =
        dataToUpdate.bill_date === "" || dataToUpdate.bill_date === "--"
          ? "Pending"
          : "Completed";

      const vessel_berthing_date = dataToUpdate.vessel_berthing_date;

      return {
        updateOne: {
          filter: identifier,
          update: {
            $set: {
              ...dataToUpdate,
              status: status,
              eta: vessel_berthing_date,
            },
          },
          upsert: true, // Create if it doesn't exist
        },
      };
    });

    // Execute the bulkWrite operation
    await JobModel.bulkWrite(bulkOperations);

    res.status(200).json({ message: "Jobs added successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
