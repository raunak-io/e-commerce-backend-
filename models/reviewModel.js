const mongoose = require('mongoose');
const Product = require('./productsModel');

const reviewSchema = new mongoose.Schema(
  {
    review: { type: String, required: [true, 'review must not be empty'] },
    rating: {
      type: Number,
      min: [1, 'rating shoulb be minimum 1'],
      max: [5, 'rating shoulb be maximum 5']
    },
    createdAt: { type: Date, default: Date.now() },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'review must belong to a product']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user ']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name image'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.product);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.rev = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.rev.constructor.calcAverageRatings(this.rev.product);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
