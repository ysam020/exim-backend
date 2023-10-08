import schedule from "node-schedule";
import JobModel from "../models/jobModel.mjs";
import express from "express";

const router = express.Router();

// Schedule to run at every 10 seconds
schedule.scheduleJob("*/10 * * * * *", async () => {
  // schedule.scheduleJob("0 21 * * *", async () => {
  try {
    // Get the current date
    const currentDate = new Date();
    // Calculate the date for comparison (delivery_date + 1 day)
    const comparisonDate = new Date(currentDate);
    comparisonDate.setDate(comparisonDate.getDate() + 1);
    // Find the documents with the given year range
    const yearLastTwoDigits = currentDate.getFullYear() % 100;
    const year = yearLastTwoDigits;
    const nextYear = yearLastTwoDigits + 1;
    const documents = await JobModel.find({
      year: `${year}-${nextYear}`,
    });

    if (!documents || !documents.length) {
      console.log("No documents found.");
      return;
    }

    for (const job of documents) {
      const deliveryDate = new Date(job.delivery_date);
      if (
        deliveryDate <= comparisonDate &&
        job.status.toLowerCase() === "pending"
      ) {
        console.log("true");
        job.status = "Completed";

        console.log(`${job.job_no}: status ${job.status}`);
        await job.save();
      }
    }
  } catch (error) {
    console.error(error);
  }
});

export default router;
