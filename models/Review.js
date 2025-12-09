import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for queries
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });

// Update product rating after review is saved
reviewSchema.post('save', async function() {
  await this.constructor.updateProductRating(this.product);
});

// Update product rating after review is deleted
reviewSchema.post('remove', async function() {
  await this.constructor.updateProductRating(this.product);
});

// Static method to calculate and update product rating
reviewSchema.statics.updateProductRating = async function(productId) {
  const Product = mongoose.model('Product');
  
  const stats = await this.aggregate([
    {
      $match: {
        product: productId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0
    });
  }
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;