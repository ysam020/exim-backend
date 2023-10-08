import mongoose from "mongoose";

const jobsLastUpdatedOnSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    trim: true,
  },
});

export default jobsLastUpdatedOnSchema;
