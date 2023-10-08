import express from "express";
import JobModel from "../models/jobModel.mjs";

const router = express.Router();

router.put("/api/updatejob/:year/:jobNo", async (req, res) => {
  const { jobNo, year } = req.params;

  const {
    eta,
    checked,
    status,
    detailed_status,
    container_nos,
    free_time,
    description,
    checklist,
    do_validity,
    remarks,
    sims_reg_no,
    pims_reg_no,
    nfmims_reg_no,
    sims_date,
    pims_date,
    nfmims_date,
    delivery_date,
    discharge_date,
    assessment_date,
    examination_date,
    duty_paid_date,
    out_of_charge_date,
    arrival_date,
    physical_weight,
    tare_weight,
  } = req.body;

  try {
    function addDaysToDate(dateString, days) {
      var date = new Date(dateString);
      date.setDate(date.getDate() + days);
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, "0");
      var day = String(date.getDate()).padStart(2, "0");
      return year + "-" + month + "-" + day;
    }

    const matchingJob = await JobModel.findOne({
      year,
      job_no: jobNo,
    });

    if (!matchingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Update the matching job with the provided data
    matchingJob.eta = eta;
    matchingJob.status = status;
    matchingJob.detailed_status = detailed_status;
    matchingJob.description = description;
    matchingJob.checklist = checklist;
    matchingJob.do_validity = do_validity;
    matchingJob.remarks = remarks;
    matchingJob.sims_reg_no =
      sims_reg_no !== undefined ? `STL-${sims_reg_no}` : "";
    matchingJob.pims_reg_no =
      pims_reg_no !== undefined ? `ORIGINAL-DPIIT-PPR-${pims_reg_no}` : "";
    matchingJob.nfmims_reg_no = nfmims_reg_no ? `MIN-${nfmims_reg_no}` : "";
    matchingJob.sims_date = sims_date;
    matchingJob.pims_date = pims_date;
    matchingJob.nfmims_date = nfmims_date;
    matchingJob.delivery_date = delivery_date;
    matchingJob.discharge_date = discharge_date;
    matchingJob.assessment_date = assessment_date;
    matchingJob.examination_date = examination_date;
    matchingJob.duty_paid_date = duty_paid_date;
    matchingJob.out_of_charge_date = out_of_charge_date;
    matchingJob.free_time = free_time;
    matchingJob.physical_weight = physical_weight;
    matchingJob.tare_weight = tare_weight;
    matchingJob.actual_weight =
      parseInt(physical_weight) - parseInt(tare_weight);

    const gross_weight = parseInt(matchingJob.gross_weight.replace(/,/g, ""));

    matchingJob.weight_shortage = matchingJob.actual_weight
      ? gross_weight - parseInt(matchingJob.actual_weight)
      : gross_weight - (parseInt(physical_weight) - parseInt(tare_weight));

    if (checked) {
      matchingJob.container_nos = container_nos.map((container) => {
        return {
          ...container,
          arrival_date: arrival_date,
          container_images: container.container_images,
          detention_from:
            arrival_date === ""
              ? ""
              : addDaysToDate(arrival_date, parseInt(free_time)),
        };
      });
    } else {
      matchingJob.container_nos = container_nos.map((container) => {
        return {
          ...container,
          arrival_date: container.arrival_date,
          container_images: container.container_images,
          detention_from:
            arrival_date === ""
              ? ""
              : addDaysToDate(arrival_date, parseInt(free_time)),
        };
      });
    }

    // Save the parent clientDoc (which contains the updated subdocument) to the database
    const updatedClient = await matchingJob.save();

    res.status(200).json(matchingJob);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
