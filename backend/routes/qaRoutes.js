import express from "express";
import { validateBody } from "../middleware/validate.js";
import { createJira, defectSchema, generateDefect, generateTestCases, jiraSchema, testCaseSchema } from "../controllers/qaController.js";

const router = express.Router();

router.post("/generate-testcases", validateBody(testCaseSchema), generateTestCases);
router.post("/generate-defect", validateBody(defectSchema), generateDefect);
router.post("/create-jira-issue", validateBody(jiraSchema), createJira);

export default router;
