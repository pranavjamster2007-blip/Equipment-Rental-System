/**
 * Category Mongoose Model
 * Represents equipment classification categories
 */

import { collections } from '../config/db.ts';

export interface ICategory {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export const CategoryModel = {
  find: (query?: any) => collections.categories.find(query),
  findById: (id: string) => collections.categories.findById(id),
  findOne: (query: any) => collections.categories.findOne(query),
  create: (data: Partial<ICategory>) => collections.categories.create(data),
  findByIdAndUpdate: (id: string, data: Partial<ICategory>) => collections.categories.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => collections.categories.findByIdAndDelete(id),
  countDocuments: (query?: any) => collections.categories.countDocuments(query),
};
