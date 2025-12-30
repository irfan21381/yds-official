import { Request, Response } from "express";
import College from "../models/College";

/**
 * 🌍 PUBLIC – Homepage colleges
 * GET /api/colleges
 */
export const getPublicColleges = async (_req: Request, res: Response) => {
  try {
    const colleges = await College.find({ isActive: true }).select("name");

    res.status(200).json({
      colleges,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch colleges" });
  }
};
