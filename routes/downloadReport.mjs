import express from "express";
const router = express.Router();
import JobModel from "../models/jobModel.mjs";

router.get(
  "/api/downloadReport/:year/:importerURL/:status",
  async (req, res) => {
    try {
      const { year, importerURL, status } = req.params;
      const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

      // Create a query object with year and importerURL criteria
      const query = {
        year,
        importerURL,
        status: formattedStatus,
      };

      // Query the database based on the criteria in the query object
      const jobs = await JobModel.find(query);

      // Sort jobs based on detailed_status priority or move empty detailed_status to the end
      jobs.sort((a, b) => {
        const statusPriority = {
          "Custom Clearance Completed": 1,
          "BE Noted, Clearance Pending": 2,
          "BE Noted, Arrival Pending": 3,
          Discharged: 4,
          "Gateway IGM Filed": 5,
          "Estimated Time of Arrival": 6,
        };

        const statusA = a.detailed_status;
        const statusB = b.detailed_status;

        if (statusA === "" && statusB === "") {
          // If both have empty detailed_status, keep their relative order
          return 0;
        } else if (statusA === "") {
          // Put empty detailed_status at the end
          return 1;
        } else if (statusB === "") {
          // Put empty detailed_status at the end
          return -1;
        } else {
          // Use the priority values for sorting non-empty detailed_status
          return statusPriority[statusA] - statusPriority[statusB];
        }
      });

      res.send(jobs);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
