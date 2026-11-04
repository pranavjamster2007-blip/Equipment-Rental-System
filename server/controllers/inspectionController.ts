/**
 * Inspection Controller
 * Manages equipment pickup and return condition checks and damage evaluations
 */

import { Response } from 'express';
import { InspectionModel } from '../models/Inspection.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

export const getAllInspections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rentalId, type } = req.query;
    let inspections = await InspectionModel.find();

    if (rentalId) {
      inspections = inspections.filter((i: any) => i.rentalId === rentalId);
    }
    if (type && type !== 'All') {
      inspections = inspections.filter((i: any) => i.inspectionType === type);
    }

    inspections.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({ success: true, count: inspections.length, inspections });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch inspections', error: error.message });
  }
};

export const createInspection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      rentalId,
      equipmentId,
      equipmentName,
      inspectionType = 'Pickup',
      conditionRating = 'Good',
      damageNotes,
      repairCostEstimate = 0,
      cleanState = true,
      approved = true,
    } = req.body;

    const inspector = req.user;

    if (!equipmentId) {
      res.status(400).json({ success: false, message: 'Equipment ID is required.' });
      return;
    }

    const inspection = await InspectionModel.create({
      rentalId: rentalId || '',
      equipmentId,
      equipmentName: equipmentName || 'Equipment Item',
      inspectorId: inspector._id,
      inspectorName: inspector.name,
      inspectionType,
      conditionRating,
      damageNotes: damageNotes || '',
      repairCostEstimate: Number(repairCostEstimate || 0),
      cleanState: Boolean(cleanState),
      approved: Boolean(approved),
    });

    res.status(201).json({
      success: true,
      message: 'Inspection report recorded successfully!',
      inspection,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create inspection report', error: error.message });
  }
};
