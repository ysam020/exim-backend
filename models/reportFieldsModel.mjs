import mongoose from "mongoose";
import reportFieldsSchema from "../schemas/reportFieldsSchema.mjs";

const ReportFieldsModel = new mongoose.model(
  "ReportFields",
  reportFieldsSchema
);
export default ReportFieldsModel;
