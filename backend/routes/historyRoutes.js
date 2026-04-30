import express from "express";
import { getDefectHistory, getJiraHistory, getStats, getTestCaseHistory } from "../controllers/historyController.js";

const router = express.Router();

router.get("/dashboard/stats", getStats);
router.get("/history/testcases", getTestCaseHistory);
router.get("/history/defects", getDefectHistory);
router.get("/history/jira", getJiraHistory);

export default router;
