import Product from '../models/products.js';
import Category from '../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      rating,
      search,
      featured,
      inStock,
      status,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (inStock !== undefined) filter.inStock = inStock === 'true';

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    // Search filter (text search)
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const products = await Product.find(filter)
      .populate('category', 'name slug icon')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if ID is valid ObjectId or slug
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('category', 'name slug icon');
    } else {
      product = await Product.findOne({ slug: id }).populate('category', 'name slug icon');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Public (should be Admin only in production)
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      stock,
      specifications,
      features,
      videoUrl,
      tags,
      featured
    } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Handle image upload
    let images = [];
    let thumbnail = '';

    if (req.files && req.files.length > 0) {
      try {
        // Upload all images to Cloudinary
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.path);
          images.push({
            url: result.url,
            publicId: result.publicId,
            alt: name
          });
        }

        // Set first image as thumbnail
        thumbnail = images[0].url;
      } catch (uploadError) {
        console.warn('Image upload failed, continuing without images:', uploadError.message);
        // Continue without images - they're optional for testing
      }
    }


    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      category,
      images,
      thumbnail,
      stock,
      specifications: specifications ? JSON.parse(specifications) : [],
      features: features ? JSON.parse(features) : [],
      videoUrl,
      tags: tags ? JSON.parse(tags) : [],
      featured: featured === 'true'
    });

    // Update category product count
    await categoryExists.updateProductCount();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Public (should be Admin only in production)
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If category is being changed, check if new category exists
    if (req.body.category && req.body.category !== product.category.toString()) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Upload new images
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path);
        newImages.push({
          url: result.url,
          publicId: result.publicId,
          alt: req.body.name || product.name
        });
      }

      // Optionally delete old images from Cloudinary
      // for (const image of product.images) {
      //   if (image.publicId) {
      //     await deleteFromCloudinary(image.publicId);
      //   }
      // }

      req.body.images = newImages;
      req.body.thumbnail = newImages[0].url;
    }

    // Parse JSON fields if they exist
    if (req.body.specifications) req.body.specifications = JSON.parse(req.body.specifications);
    if (req.body.features) req.body.features = JSON.parse(req.body.features);
    if (req.body.tags) req.body.tags = JSON.parse(req.body.tags);
    if (req.body.featured !== undefined) req.body.featured = req.body.featured === 'true';

    // Update product
    product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug icon');

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public (should be Admin only in production)
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        await deleteFromCloudinary(image.publicId);
      }
    }

    // Get category before deleting product
    const categoryId = product.category;

    await product.deleteOne();

    // Update category product count
    const category = await Category.findById(categoryId);
    if (category) {
      await category.updateProductCount();
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true, status: 'active' })
      .populate('category', 'name slug icon')
      .sort('-createdAt')
      .limit(6)
      .lean();

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};