import mongoose from "mongoose";

const testCaseRunSchema = new mongoose.Schema(
  {
    requirement: { type: String, required: true },
    model: { type: String, required: true },
    cases: { type: Array, default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("TestCaseRun", testCaseRunSchema);
