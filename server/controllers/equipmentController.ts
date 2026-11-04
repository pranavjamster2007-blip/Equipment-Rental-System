/**
 * Equipment Controller
 * Manages equipment inventory, pricing, availability, and search/filter/pagination
 */

import { Request, Response } from 'express';
import { EquipmentModel } from '../models/Equipment.ts';
import { CategoryModel } from '../models/Category.ts';

export const getAllEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, status, sortBy, order = 'asc', page = '1', limit = '12' } = req.query;

    let items = await EquipmentModel.find();

    // 1. Filter by category
    if (category && category !== 'All') {
      items = items.filter((item: any) => item.categoryId === category || item.categoryName === category);
    }

    // 2. Filter by status
    if (status && status !== 'All') {
      items = items.filter((item: any) => item.status === status);
    }

    // 3. Search query
    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter((item: any) =>
        item.name.toLowerCase().includes(q) ||
        (item.modelNumber && item.modelNumber.toLowerCase().includes(q)) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // 4. Sorting
    if (sortBy === 'price') {
      items.sort((a: any, b: any) => order === 'desc' ? b.dailyRate - a.dailyRate : a.dailyRate - b.dailyRate);
    } else if (sortBy === 'name') {
      items.sort((a: any, b: any) => order === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
    } else {
      // Default: Newest first
      items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // 5. Pagination
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, parseInt(String(limit)) || 12);
    const totalCount = items.length;
    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = items.slice(startIndex, startIndex + limitNum);

    res.status(200).json({
      success: true,
      count: totalCount,
      totalPages,
      currentPage: pageNum,
      equipment: paginatedItems,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve equipment', error: error.message });
  }
};

export const getEquipmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await EquipmentModel.findById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Equipment item not found' });
      return;
    }
    res.status(200).json({ success: true, equipment: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch equipment details', error: error.message });
  }
};

export const createEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      categoryId,
      modelNumber,
      serialNumber,
      dailyRate,
      securityDeposit,
      status = 'Available',
      condition = 'Good',
      description,
      imageUrl,
    } = req.body;

    // Strict validation
    if (!name || !categoryId || dailyRate === undefined || dailyRate === null) {
      res.status(400).json({
        success: false,
        message: 'Name, Category, and Daily Rate are mandatory fields.',
      });
      return;
    }

    const category = await CategoryModel.findById(categoryId);
    const categoryName = category ? category.name : 'General';

    const newItem = await EquipmentModel.create({
      name,
      categoryId,
      categoryName,
      modelNumber: modelNumber || `MOD-${Math.floor(1000 + Math.random() * 9000)}`,
      serialNumber: serialNumber || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
      dailyRate: Number(dailyRate),
      securityDeposit: Number(securityDeposit || (dailyRate * 3)),
      status,
      condition,
      description: description || '',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    });

    res.status(201).json({
      success: true,
      message: 'Equipment registered into inventory successfully!',
      equipment: newItem,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create equipment', error: error.message });
  }
};

export const updateEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = { ...req.body };
    if (updates.dailyRate) updates.dailyRate = Number(updates.dailyRate);
    if (updates.securityDeposit) updates.securityDeposit = Number(updates.securityDeposit);

    if (updates.categoryId) {
      const cat = await CategoryModel.findById(updates.categoryId);
      if (cat) updates.categoryName = cat.name;
    }

    const updated = await EquipmentModel.findByIdAndUpdate(req.params.id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Equipment not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Equipment record updated successfully!',
      equipment: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update equipment', error: error.message });
  }
};

export const deleteEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await EquipmentModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Equipment not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Equipment deleted from inventory.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete equipment', error: error.message });
  }
};
