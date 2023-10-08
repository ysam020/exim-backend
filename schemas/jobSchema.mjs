import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  year: { type: String, trim: true },
  job_no: { type: String, trim: true },
  custom_house: { type: String, trim: true },
  job_date: { type: String, trim: true },
  importer: { type: String, trim: true },
  importerURL: { type: String, trim: true },
  supplier_exporter: { type: String, trim: true },
  invoice_number: { type: String, trim: true },
  invoice_date: { type: String, trim: true },
  awb_bl_no: { type: String, trim: true },
  awb_bl_date: { type: String, trim: true },
  description: { type: String, trim: true },
  be_no: { type: String, trim: true },
  be_date: { type: String, trim: true },
  type_of_b_e: { type: String, trim: true },
  no_of_pkgs: { type: String, trim: true },
  unit: { type: String, trim: true },
  gross_weight: { type: String, trim: true },
  unit_1: { type: String, trim: true },
  gateway_igm: { type: String, trim: true },
  gateway_igm_date: { type: String, trim: true },
  igm_no: { type: String, trim: true },
  igm_date: { type: String, trim: true },
  loading_port: { type: String, trim: true },
  origin_country: { type: String, trim: true },
  port_of_reporting: { type: String, trim: true },
  shipping_line_airline: { type: String, trim: true },
  free_time: { type: Number, trim: true },
  remarks: { type: String, trim: true },
  do_validity: { type: String, trim: true },
  container_nos: [
    {
      container_number: { type: String, trim: true },
      arrival_date: { type: String, trim: true },
      detention_from: { type: String, trim: true },
      size: { type: String, trim: true },
      container_images: [{ url: { type: String, trim: true } }],
      weighment_slip_images: [{ url: { type: String, trim: true } }],
    },
  ],
  container_count: { type: String, trim: true },
  no_of_container: { type: String, trim: true },
  toi: { type: String, trim: true },
  unit_price: { type: String, trim: true },
  cif_amount: { type: String, trim: true },
  assbl_value: { type: String, trim: true },
  total_duty: { type: String, trim: true },
  out_of_charge: { type: String, trim: true },
  consignment_type: { type: String, trim: true },
  bill_no: { type: String, trim: true },
  bill_date: { type: String, trim: true },
  cth_no: { type: String, trim: true },
  status: { type: String, trim: true },
  detailed_status: { type: String, trim: true },
  sims_reg_no: {
    type: String,
    trim: true,
  },
  pims_reg_no: {
    type: String,
    trim: true,
  },
  nfmims_reg_no: {
    type: String,
    trim: true,
  },
  sims_date: {
    type: String,
    trim: true,
  },
  pims_date: {
    type: String,
    trim: true,
  },
  nfmims_date: {
    type: String,
    trim: true,
  },
  delivery_date: {
    type: String,
    trim: true,
  },
  eta: {
    type: String,
    trim: true,
  },
  discharge_date: {
    type: String,
    trim: true,
  },
  assessment_date: {
    type: String,
    trim: true,
  },
  examination_date: {
    type: String,
    trim: true,
  },
  duty_paid_date: {
    type: String,
    trim: true,
  },
  out_of_charge_date: {
    type: String,
    trim: true,
  },
  exrate: { type: String, trim: true },
  inv_currency: { type: String, trim: true },
  physical_weight: { type: String, trim: true },
  tare_weight: { type: String, trim: true },
  actual_weight: { type: String, trim: true },
  weight_shortage: { type: String, trim: true },
});

jobSchema.index({ importerURL: 1, year: 1, status: 1 });
jobSchema.index({ year: 1, job_no: 1 }, { unique: true });

export default jobSchema;
