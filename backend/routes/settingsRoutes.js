import express from "express";
import { getSettings, saveSettings, settingsSchema } from "../controllers/settingsController.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

router.get("/settings", getSettings);
router.put("/settings", validateBody(settingsSchema), saveSettings);

export default router;
