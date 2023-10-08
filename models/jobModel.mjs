import mongoose from "mongoose";
import jobSchema from "../schemas/jobSchema.mjs";

const JobModel = new mongoose.model("Job", jobSchema);
export default JobModel;
