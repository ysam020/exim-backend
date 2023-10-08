import express from "express";
import JobModel from "../models/jobModel.mjs";

const router = express.Router();

router.get(
  "/api/:year/:importerURL/jobs/:status/:pageNo/:filterJobNumber/:detailedStatus",
  async (req, res) => {
    try {
      const {
        year,
        importerURL,
        status,
        pageNo,
        filterJobNumber,
        detailedStatus,
      } = req.params;
      const itemsPerPage = 25; // Number of items to show per page
      const skip = (pageNo - 1) * itemsPerPage;

      // Create a query object with year and importerURL criteria
      const query = {
        year,
        importerURL,
      };

      // Convert the status parameter to title case (e.g., "pending" to "Pending")
      const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

      // Check if status is one of the specific values ("Pending", "Completed", "Canceled")
      if (
        formattedStatus === "Pending" ||
        formattedStatus === "Completed" ||
        formattedStatus === "Cancelled"
      ) {
        query.status = formattedStatus; // Filter by specific status
      }

      // Match the detailed status stored in db
      if (detailedStatus !== "all") {
        if (detailedStatus === "estimated_time_of_arrival") {
          query.detailed_status = "Estimated Time of Arrival";
        }
        if (detailedStatus === "discharged") {
          query.detailed_status = "Discharged";
        }
        if (detailedStatus === "gateway_igm_filed") {
          query.detailed_status = "Gateway IGM Filed";
        }
        if (detailedStatus === "be_noted_arrival_pending") {
          query.detailed_status = "BE Noted, Arrival Pending";
        }
        if (detailedStatus === "be_noted_clearance_pending") {
          query.detailed_status = "BE Noted, Clearance Pending";
        }
        if (detailedStatus === "custom_clearance_completed") {
          query.detailed_status = "Custom Clearance Completed";
        }
      }

      // Check if filterJobNumber is provided and not empty
      if (filterJobNumber.trim() !== "all" && filterJobNumber.trim() !== "") {
        // Add a condition to filter by job_no containing filterJobNumber
        query.job_no = { $regex: filterJobNumber, $options: "i" }; // Case-insensitive matching
      }

      // Query the database and select relevant field as per detailed status
      let jobs;

      if (detailedStatus === "estimated_time_of_arrival") {
        console.log(query);
        jobs = await JobModel.find(query).select(
          "job_no custom_house awb_bl_no container_nos eta remarks detailed_status"
        );
      } else if (detailedStatus === "discharged") {
        // For other detailedStatus values, select all fields
        jobs = await JobModel.find(query).select(
          "job_no custom_house awb_bl_no container_nos discharge_date remarks detailed_status"
        );
      } else if (detailedStatus === "gateway_igm_filed") {
        // For other detailedStatus values, select all fields
        jobs = await JobModel.find(query).select(
          "job_no custom_house awb_bl_no container_nos eta remarks detailed_status"
        );
      } else if (detailedStatus === "be_noted_arrival_pending") {
        // For other detailedStatus values, select all fields
        jobs = await JobModel.find(query).select(
          "job_no custom_house be_no be_date container_nos eta remarks detailed_status"
        );
      } else if (detailedStatus === "be_noted_clearance_pending") {
        // For other detailedStatus values, select all fields
        jobs = await JobModel.find(query).select(
          "job_no custom_house be_no be_date container_nos remarks detailed_status"
        );
      } else if (detailedStatus === "custom_clearance_completed") {
        // For other detailedStatus values, select all fields
        jobs = await JobModel.find(query).select(
          "job_no custom_house be_no be_date container_nos out_of_charge_date remarks detailed_status"
        );
      } else {
        jobs = await JobModel.find(query).select(
          "job_no custom_house awb_bl_no container_nos eta remarks detailed_status"
        );
      }

      // Sort the jobs as per detailed status
      if (detailedStatus === "estimated_time_of_arrival") {
        // Sort the sorted jobs by ETA using the custom sorting function
        jobs = jobs.sort(sortETA);
      }
      if (detailedStatus === "discharged") {
        // Sort the sorted jobs by discharge date using the custom sorting function
        jobs = jobs.sort(sortDischargeDate);
      }

      // Limit the results to 25 items after sorting
      jobs = jobs.slice(skip, skip + itemsPerPage);

      // Calculate the total count of matching documents
      const total = await JobModel.countDocuments(query);

      function sortETA(a, b) {
        // Helper function to parse date strings into Date objects
        function parseDate(dateString) {
          const parts = dateString.split("-");
          return new Date(parts[0], parts[1] - 1, parts[2]);
        }

        // Extract the eta field from each job item
        const etaA = a.eta;
        const etaB = b.eta;

        // If both job items have valid eta values, compare them as Date objects
        if (etaA && etaB) {
          const dateA = parseDate(etaA);
          const dateB = parseDate(etaB);

          // Compare the dates as Date objects
          if (dateA < dateB) {
            return -1;
          } else if (dateA > dateB) {
            return 1;
          } else {
            return 0;
          }
        }

        // If only one job item has a valid eta value, it comes first
        if (etaA) {
          return -1;
        }
        if (etaB) {
          return 1;
        }

        // If neither job item has a valid eta value, leave them in their original order
        return 0;
      }

      function sortDischargeDate(a, b) {
        // Helper function to parse date strings into Date objects
        function parseDate(dateString) {
          const parts = dateString.split("-");
          return new Date(parts[0], parts[1] - 1, parts[2]);
        }

        // Extract the eta field from each job item
        const discharge_date_A = a.discharge_date;
        const discharge_date_B = b.discharge_date;

        // If both job items have valid eta values, compare them as Date objects
        if (discharge_date_A && discharge_date_B) {
          const dateA = parseDate(discharge_date_A);
          const dateB = parseDate(discharge_date_B);

          // Compare the dates as Date objects
          if (dateA < dateB) {
            return -1;
          } else if (dateA > dateB) {
            return 1;
          } else {
            return 0;
          }
        }

        // If only one job item has a valid eta value, it comes first
        if (discharge_date_A) {
          return -1;
        }
        if (discharge_date_B) {
          return 1;
        }

        // If neither job item has a valid eta value, leave them in their original order
        return 0;
      }

      res.send({ data: jobs, total });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
