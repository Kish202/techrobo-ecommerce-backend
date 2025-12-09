import Category from '../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const { status, sort = 'order' } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const categories = await Category.find(filter).sort(sort).lean();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if ID is valid ObjectId or slug
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id);
    } else {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Public (should be Admin only in production)
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, order, status } = req.body;

    // Handle image upload if provided
    let image = {};
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'robotech/categories');
      image = {
        url: result.url,
        publicId: result.publicId
      };
    }

    const category = await Category.create({
      name,
      description,
      icon,
      image,
      order,
      status
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Public (should be Admin only in production)
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    let category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (category.image && category.image.publicId) {
        await deleteFromCloudinary(category.image.publicId);
      }

      const result = await uploadToCloudinary(req.file.path, 'robotech/categories');
      req.body.image = {
        url: result.url,
        publicId: result.publicId
      };
    }

    category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Public (should be Admin only in production)
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    if (category.productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with products. Please delete or reassign products first.'
      });
    }

    // Delete image from Cloudinary
    if (category.image && category.image.publicId) {
      await deleteFromCloudinary(category.image.publicId);
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};