import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    default: '📦'
  },
  image: {
    type: String
  },
  productCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Create slug from name before saving
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Method to update product count
categorySchema.methods.updateProductCount = async function () {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ category: this._id });
  this.productCount = count;
  await this.save();
  return count;
};

const Category = mongoose.model('Category', categorySchema);

export default Category;