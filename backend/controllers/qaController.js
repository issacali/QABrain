import Joi from "joi";
import TestCaseRun from "../models/TestCaseRun.js";
import DefectRun from "../models/DefectRun.js";
import JiraLog from "../models/JiraLog.js";
import { getProvider } from "../services/aiService.js";
import { createJiraIssue } from "../services/jiraService.js";

export const testCaseSchema = Joi.object({
  requirement: Joi.string().min(10).required(),
  model: Joi.string().valid("chatgpt", "gemini", "ollama").optional()
});

export const defectSchema = Joi.object({
  scenario: Joi.string().min(10).required(),
  model: Joi.string().valid("chatgpt", "gemini", "ollama").optional()
});

export const jiraSchema = Joi.object({
  summary: Joi.string().min(5).required(),
  description: Joi.string().min(10).required(),
  priority: Joi.string().default("High")
});

export async function generateTestCases(req, res, next) {
  try {
    const provider = await getProvider(req.body.model);
    const output = await provider.generateTestCases(req.body.requirement);
    const doc = await TestCaseRun.create({
      requirement: req.body.requirement,
      model: req.body.model || "active",
      cases: output.testCases || []
    });
    res.json({ id: doc._id, testCases: output.testCases || [] });
  } catch (err) {
    next(err);
  }
}

export async function generateDefect(req, res, next) {
  try {
    const provider = await getProvider(req.body.model);
    const defect = await provider.generateDefectReport(req.body.scenario);
    const doc = await DefectRun.create({
      scenario: req.body.scenario,
      model: req.body.model || "active",
      defect
    });
    res.json({ id: doc._id, defect });
  } catch (err) {
    next(err);
  }
}

export async function createJira(req, res, next) {
  try {
    const jira = await createJiraIssue(req.body);
    await JiraLog.create({ ...req.body, ...jira });
    res.json({ message: "Jira bug created successfully", ...jira });
  } catch (err) {
    next(err);
  }
}
