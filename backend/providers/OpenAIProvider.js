import axios from "axios";
import BaseProvider from "./BaseProvider.js";

function extractJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(text.slice(first, last + 1));
    throw new Error("AI output is not valid JSON");
  }
}

export default class OpenAIProvider extends BaseProvider {
  constructor({ apiKey, model }) {
    super();
    this.apiKey = apiKey;
    this.model = model;
  }

  async ask(prompt) {
    if (!this.apiKey) throw new Error("OpenAI API key missing");
    const { data } = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      },
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );
    return data.choices[0].message.content;
  }

  async generateTestCases(requirement) {
    const prompt = `You are a QA Engineer. Generate structured test cases for functional, negative, and boundary tests.
Return strict JSON: {"testCases":[{"id":"","scenario":"","preconditions":"","steps":[],"expectedResult":"","type":""}]}
Requirement:\n${requirement}`;
    return extractJSON(await this.ask(prompt));
  }

  async generateDefectReport(scenario) {
    const prompt = `You are a QA Bug Analyst. Return strict JSON:
{"summary":"","stepsToReproduce":[],"expectedResult":"","actualResult":"","severity":"","priority":"","environment":"","rootCause":""}
Input:\n${scenario}`;
    return extractJSON(await this.ask(prompt));
  }
}
