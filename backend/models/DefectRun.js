import mongoose from "mongoose";

const defectRunSchema = new mongoose.Schema(
  {
    scenario: { type: String, required: true },
    model: { type: String, required: true },
    defect: { type: Object, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("DefectRun", defectRunSchema);
