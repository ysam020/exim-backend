import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import compression from "compression";
import getJobsList from "./routes/getJobList.mjs";
import getJob from "./routes/getJobRoute.mjs";
import updateJob from "./routes/updateJob.mjs";
import addJob from "./routes/addJobsFromExcel.mjs";
import login from "./routes/login.mjs";
import register from "./routes/register.mjs";
import getJobsOverview from "./routes/getJobsOverview.mjs";
import importerJobs from "./routes/importerJobs.mjs";
import getImporterList from "./routes/getImporterList.mjs";
import getUsers from "./routes/getUsers.mjs";
import getUsersWithJobs from "./routes/getUsersWithJobs.mjs";
import getAssignedimporter from "./routes/getAssignedImporter.mjs";
import assignJobs from "./routes/assignJobs.mjs";
import updateLastJobsDate from "./routes/addLastJobsDate.mjs";
import getLastJobsDate from "./routes/getLastJobsDate.mjs";
import importerListToAssignJobs from "./routes/importerListToAssignJobs.mjs";
import getYears from "./routes/getYears.mjs";
import removeUser from "./routes/removeUser.mjs";
import getReportFields from "./routes/getReportFields.mjs";
import getReport from "./routes/getReport.mjs";
import convertToExcel from "./routes/convertToExcel.mjs";
import updateStatus from "./routes/updateStatus.mjs";
// import sendOtp from "./routes/sendOtp.mjs";
import sendChangePasswordOtp from "./routes/sendChangePasswordOtp.mjs";
import feedback from "./routes/feedback.mjs";
import removeJobs from "./routes/removeJobs.mjs";
import changePassword from "./routes/changePassword.mjs";
import downloadReport from "./routes/downloadReport.mjs";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

dotenv.config();
const app = express();
app.use(bodyParser.json({ limit: "100mb" }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());

mongoose.set("strictQuery", true);

mongoose
  .connect(
    process.env.MONGODB_URI,
    // "mongodb://localhost:27017/exim",

    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    app.use(getJobsList);

    app.use(getJob);

    app.use(updateJob);

    app.use(addJob);

    app.use(login);

    app.use(register);

    app.use(getJobsOverview);

    app.use(importerJobs);

    app.use(getImporterList);

    app.use(getUsers);

    app.use(getUsersWithJobs);

    app.use(assignJobs);

    app.use(getAssignedimporter);

    app.use(updateLastJobsDate);

    app.use(getLastJobsDate);

    app.use(importerListToAssignJobs);

    app.use(getYears);

    app.use(getReport);

    app.use(removeUser);

    app.use(getReportFields);

    app.use(convertToExcel);

    app.use(updateStatus);

    // app.use(sendOtp);

    app.use(sendChangePasswordOtp);

    app.use(feedback);

    app.use(removeJobs);

    app.use(changePassword);

    app.use(downloadReport);

    app.listen(process.env.PORT, () => {
      console.log(`BE started at port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));
