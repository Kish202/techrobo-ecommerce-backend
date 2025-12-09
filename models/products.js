import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function (value) {
        return value < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    alt: String
  }],
  thumbnail: {
    type: String,
    required: false // Optional for testing without images
  },

  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  specifications: [{
    key: String,
    value: String
  }],
  features: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  videoUrl: String,
  tags: [String]
}, {
  timestamps: true
});

// Create slug from name before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Update inStock status based on stock quantity
  this.inStock = this.stock > 0;

  next();
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
//productSchema.index({ slug: 1 })
productSchema.index({ featured: 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;