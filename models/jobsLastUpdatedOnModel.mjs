import mongoose from "mongoose";
import jobsLastUpdatedOnSchema from "../schemas/jobsLastUpdatedOnSchema.mjs";

const LastJobsDate = new mongoose.model(
  "JobsLastUpdated",
  jobsLastUpdatedOnSchema
);
export default LastJobsDate;
