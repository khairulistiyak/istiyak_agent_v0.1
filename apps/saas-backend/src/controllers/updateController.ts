import { Request, Response, NextFunction } from "express";
import { getLatestUpdate } from "../services/updateService.js";

export async function checkUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const { platform, arch, currentVersion } = req.query;
    if (!platform || !arch || !currentVersion) {
      return res.status(400).json({ error: "platform, arch and currentVersion query parameters are required." });
    }
    const update = await getLatestUpdate(platform as string, arch as string, currentVersion as string);
    if (!update) {
      return res.status(204).send();
    }
    return res.status(200).json(update);
  } catch (err) {
    next(err);
  }
}
