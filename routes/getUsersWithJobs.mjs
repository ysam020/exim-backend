import express from "express";
import UserModel from "../models/userModel.mjs";
import JobModel from "../models/jobModel.mjs";

const router = express.Router();

router.get("/api/getUsersWithJobs/:year", async (req, res) => {
  try {
    const year = req.params.year; // Get the "year" parameter from the request params.

    // Fetch all jobs for the specified year and status "Pending" once
    const yearJobs = await JobModel.find({ year: year, status: "Pending" });

    // Create a map of importerURL to pending job count
    const importerJobsMap = {};
    for (const job of yearJobs) {
      const { importerURL } = job;
      if (!importerJobsMap[importerURL]) {
        importerJobsMap[importerURL] = 0;
      }
      importerJobsMap[importerURL]++;
    }

    // Fetch users with importers
    const users = await UserModel.find({}, { username: 1, importers: 1 });

    // Process users concurrently
    const usersWithJobs = await Promise.all(
      users.map(async (user) => {
        const { username, importers } = user;
        let totalJobsCount = 0;

        // Count pending jobs for each importer
        for (const importerData of importers) {
          const { importerURL } = importerData;
          if (importerJobsMap[importerURL]) {
            totalJobsCount += importerJobsMap[importerURL];
          }
        }

        return { username, jobsCount: totalJobsCount };
      })
    );

    res.json(usersWithJobs);
  } catch (error) {
    console.error("Error fetching users with jobs:", error);
    res.status(500).json({ error: "Failed to fetch users with jobs" });
  }
});

export default router;
