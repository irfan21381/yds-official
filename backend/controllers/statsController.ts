import { Request, Response } from "express";
import Stats from "../models/Stats";

/**
 * PUBLIC: Get stats for homepage
 * GET /api/stats
 */
export const getPublicStats = async (_req: Request, res: Response) => {
  try {
    let stats = await Stats.findOne();

    // If stats not exists, create default one
    if (!stats) {
      stats = await Stats.create({});
    }

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

/**
 * ADMIN: Get stats
 * GET /api/admin/stats
 */
export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    let stats = await Stats.findOne();
    if (!stats) {
      stats = await Stats.create({});
    }
    res.status(200).json(stats);
  } catch {
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

/**
 * ADMIN: Update stats
 * PUT /api/admin/stats
 */
export const updateStats = async (req: Request, res: Response) => {
  try {
    const { colleges, students, internships, products } = req.body;

    let stats = await Stats.findOne();

    if (!stats) {
      stats = await Stats.create({
        colleges,
        students,
        internships,
        products,
      });
    } else {
      stats.colleges = colleges ?? stats.colleges;
      stats.students = students ?? stats.students;
      stats.internships = internships ?? stats.internships;
      stats.products = products ?? stats.products;

      await stats.save();
    }

    res.status(200).json(stats);
  } catch {
    res.status(500).json({ message: "Failed to update stats" });
  }
};
