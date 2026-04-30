import Joi from "joi";
import Setting from "../models/Setting.js";
import { decrypt, encrypt } from "../utils/crypto.js";

export const settingsSchema = Joi.object({
  ai: Joi.object({
    activeModel: Joi.string().valid("chatgpt", "gemini", "ollama").required(),
    openai: Joi.object({
      apiKey: Joi.string().allow(""),
      model: Joi.string().required()
    }).required(),
    gemini: Joi.object({
      apiKey: Joi.string().allow(""),
      model: Joi.string().required()
    }).required(),
    ollama: Joi.object({
      endpoint: Joi.string().required(),
      model: Joi.string().required()
    }).required()
  }).required(),
  jira: Joi.object({
    baseUrl: Joi.string().allow(""),
    email: Joi.string().allow(""),
    token: Joi.string().allow(""),
    projectKey: Joi.string().allow("")
  }).required()
});

export async function getSettings(req, res, next) {
  try {
    const s = await Setting.findOne();
    if (!s) return res.json(null);
    const plain = s.toObject();
    plain.ai.openai.apiKey = plain.ai.openai.apiKey ? "********" : "";
    plain.ai.gemini.apiKey = plain.ai.gemini.apiKey ? "********" : "";
    plain.jira.token = plain.jira.token ? "********" : "";
    res.json(plain);
  } catch (err) {
    next(err);
  }
}

export async function saveSettings(req, res, next) {
  try {
    const existing = await Setting.findOne();
    const payload = req.body;
    const openaiKey = payload.ai.openai.apiKey === "********" ? decrypt(existing?.ai?.openai?.apiKey) : payload.ai.openai.apiKey;
    const geminiKey = payload.ai.gemini.apiKey === "********" ? decrypt(existing?.ai?.gemini?.apiKey) : payload.ai.gemini.apiKey;
    const jiraToken = payload.jira.token === "********" ? decrypt(existing?.jira?.token) : payload.jira.token;

    const doc = await Setting.findOneAndUpdate(
      {},
      {
        ...payload,
        ai: {
          ...payload.ai,
          openai: { ...payload.ai.openai, apiKey: encrypt(openaiKey || "") },
          gemini: { ...payload.ai.gemini, apiKey: encrypt(geminiKey || "") }
        },
        jira: { ...payload.jira, token: encrypt(jiraToken || "") }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ message: "Settings saved", id: doc._id });
  } catch (err) {
    next(err);
  }
}
