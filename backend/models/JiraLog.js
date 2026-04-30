import mongoose from "mongoose";

const jiraLogSchema = new mongoose.Schema(
  {
    summary: String,
    description: String,
    priority: String,
    issueKey: String,
    issueUrl: String,
    rawResponse: Object
  },
  { timestamps: true }
);

export default mongoose.model("JiraLog", jiraLogSchema);
