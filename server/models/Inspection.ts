/**
 * Inspection Mongoose Model
 * Represents equipment inspection at pickup and return with damage notes & condition ratings
 */

import { collections } from '../config/db.ts';

export interface IInspection {
  _id: string;
  rentalId: string;
  equipmentId: string;
  equipmentName: string;
  inspectorId: string;
  inspectorName: string;
  inspectionType: 'Pickup' | 'Return';
  conditionRating: 'Excellent' | 'Good' | 'Fair' | 'Damaged';
  damageNotes?: string;
  repairCostEstimate: number;
  cleanState: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export const InspectionModel = {
  find: (query?: any) => collections.inspections.find(query),
  findById: (id: string) => collections.inspections.findById(id),
  findOne: (query: any) => collections.inspections.findOne(query),
  create: (data: Partial<IInspection>) => collections.inspections.create(data),
  findByIdAndUpdate: (id: string, data: Partial<IInspection>) => collections.inspections.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => collections.inspections.findByIdAndDelete(id),
  countDocuments: (query?: any) => collections.inspections.countDocuments(query),
};
