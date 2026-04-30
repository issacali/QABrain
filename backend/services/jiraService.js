import axios from "axios";
import Setting from "../models/Setting.js";
import { decrypt } from "../utils/crypto.js";

export async function createJiraIssue({ summary, description, priority }) {
  const settings = await Setting.findOne();
  if (!settings?.jira?.baseUrl || !settings?.jira?.email || !settings?.jira?.token || !settings?.jira?.projectKey) {
    throw new Error("Jira settings are incomplete");
  }
  const token = decrypt(settings.jira.token);
  const auth = Buffer.from(`${settings.jira.email}:${token}`).toString("base64");
  const payload = {
    fields: {
      project: { key: settings.jira.projectKey },
      summary,
      description,
      issuetype: { name: "Bug" },
      priority: { name: priority || "High" }
    }
  };
  const { data } = await axios.post(`${settings.jira.baseUrl}/rest/api/3/issue`, payload, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
  return {
    issueKey: data.key,
    issueUrl: `${settings.jira.baseUrl}/browse/${data.key}`,
    rawResponse: data
  };
}
