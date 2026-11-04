/**
 * Category Controller
 * CRUD operations for Equipment Categories
 */

import { Request, Response } from 'express';
import { CategoryModel } from '../models/Category.ts';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CategoryModel.find();
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, icon = 'Layers' } = req.body;
    if (!name || !description) {
      res.status(400).json({ success: false, message: 'Category name and description are required.' });
      return;
    }

    const category = await CategoryModel.create({ name, description, icon });
    res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, icon } = req.body;
    const updated = await CategoryModel.findByIdAndUpdate(req.params.id, {
      ...(name && { name }),
      ...(description && { description }),
      ...(icon && { icon }),
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Category updated successfully', category: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};
