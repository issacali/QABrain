import TestCaseRun from "../models/TestCaseRun.js";
import DefectRun from "../models/DefectRun.js";
import JiraLog from "../models/JiraLog.js";
import Setting from "../models/Setting.js";

export async function getStats(req, res, next) {
  try {
    const [testCases, defects, jira, settings] = await Promise.all([
      TestCaseRun.countDocuments(),
      DefectRun.countDocuments(),
      JiraLog.countDocuments(),
      Setting.findOne()
    ]);
    res.json({
      testCases,
      defects,
      jira,
      activeModel: settings?.ai?.activeModel || "chatgpt"
    });
  } catch (err) {
    next(err);
  }
}

export async function getTestCaseHistory(req, res, next) {
  try {
    const rows = await TestCaseRun.find().sort({ createdAt: -1 }).limit(50);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getDefectHistory(req, res, next) {
  try {
    const rows = await DefectRun.find().sort({ createdAt: -1 }).limit(50);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getJiraHistory(req, res, next) {
  try {
    const rows = await JiraLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}
