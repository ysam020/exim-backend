import express from "express";
import ReportFieldsModel from "../models/reportFieldsModel.mjs";

const router = express.Router();

router.get("/api/getReportFields/:importerURL", async (req, res) => {
  const importerURL = req.params.importerURL;

  try {
    const reportFields = await ReportFieldsModel.findOne({ importerURL });

    if (!reportFields) {
      return res.status(404).json({ message: "Importer URL not found" });
    }

    res.json(reportFields.field);
  } catch (error) {
    console.error("Error retrieving report fields:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
